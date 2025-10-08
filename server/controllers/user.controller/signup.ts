import { RequestHandler } from 'express';
import { User } from '../../models/user';
import { generateToken, userResponse } from './helpers';
import { renderEmailConfirmation } from '../../views/mail';
import { mailerService } from '../../utils/mail';
import { Error, PublicUser } from '../../types';

export interface CreateUserRequestBody {
  username: string;
  email: string;
  password: string;
}
export interface DuplicateUserCheckQuery {
  // eslint-disable-next-line camelcase
  check_type: 'email' | 'username';
  email?: string;
  username?: string;
}
export interface VerifyEmailQuery {
  t: string;
}

export const createUser: RequestHandler<
  {},
  PublicUser | Error,
  CreateUserRequestBody
> = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const emailLowerCase = email.toLowerCase();
    const existingUser = await User.findByEmailAndUsername(email, username);
    if (existingUser) {
      const fieldInUse =
        existingUser.email.toLowerCase() === emailLowerCase
          ? 'Email'
          : 'Username';
      res.status(422).send({ error: `${fieldInUse} is in use` });
      return;
    }

    const EMAIL_VERIFY_TOKEN_EXPIRY_TIME = Date.now() + 3600000 * 24; // 24 hours
    const token = await generateToken();
    const user = new User({
      username,
      email: emailLowerCase,
      password,
      verified: User.EmailConfirmation().Sent,
      verifiedToken: token,
      verifiedTokenExpires: EMAIL_VERIFY_TOKEN_EXPIRY_TIME
    });

    await user.save();

    req.logIn(user, async (loginErr) => {
      if (loginErr) {
        console.error(loginErr);
        res.status(500).json({ error: 'Failed to log in user.' });
        return;
      }

      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const mailOptions = renderEmailConfirmation({
        body: {
          domain: `${protocol}://${req.headers.host}`,
          link: `${protocol}://${req.headers.host}/verify?t=${token}`
        },
        to: req.user!.email
      });

      try {
        await mailerService.send(mailOptions);
        res.json(userResponse(user));
      } catch (mailErr) {
        console.error(mailErr);
        res.status(500).json({ error: 'Failed to send verification email.' });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

export const duplicateUserCheck: RequestHandler<
  {},
  {},
  {},
  DuplicateUserCheckQuery
> = async (req, res) => {
  const checkType = req.query.check_type;
  const value = req.query[checkType];
  const options = { caseInsensitive: true, valueType: checkType };
  const user = await User.findByEmailOrUsername(value!, options);
  if (user) {
    return res.json({
      exists: true,
      message: `This ${checkType} is already taken.`,
      type: checkType
    });
  }
  return res.json({
    exists: false,
    type: checkType
  });
};

export const verifyEmail: RequestHandler<{}, {}, {}, VerifyEmailQuery> = async (
  req,
  res
) => {
  const token = req.query.t;
  const user = await User.findOne({
    verifiedToken: token,
    verifiedTokenExpires: { $gt: new Date() }
  }).exec();
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired.'
    });
    return;
  }
  user.verified = User.EmailConfirmation().Verified;
  user.verifiedToken = null;
  user.verifiedTokenExpires = null;
  await user.save();
  res.json({ success: true });
};

export const emailVerificationInitiate: RequestHandler<
  {},
  PublicUser | Error
> = async (req, res) => {
  try {
    const token = await generateToken();
    const user = await User.findById(req.user!.id).exec();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (user.verified === User.EmailConfirmation().Verified) {
      res.status(409).json({ error: 'Email already verified' });
      return;
    }
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const mailOptions = renderEmailConfirmation({
      body: {
        domain: `${protocol}://${req.headers.host}`,
        link: `${protocol}://${req.headers.host}/verify?t=${token}`
      },
      to: user.email
    });
    try {
      await mailerService.send(mailOptions);
    } catch (mailErr) {
      res.status(500).send({ error: 'Error sending mail' });
      return;
    }
    const EMAIL_VERIFY_TOKEN_EXPIRY_TIME = Date.now() + 3600000 * 24; // 24 hours
    user.verified = User.EmailConfirmation().Resent;
    user.verifiedToken = token;
    user.verifiedTokenExpires = EMAIL_VERIFY_TOKEN_EXPIRY_TIME; // 24 hours
    await user.save();

    res.json(userResponse(req.user!));
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
