import { User } from '../models/user';
import { mailerService } from '../utils/mail';
import { renderEmailConfirmation, renderResetPassword } from '../views/mail';

import { userResponse, generateToken } from './user.controller/helpers';

export * from './user.controller/apiKey';
export * from './user.controller/signup';

export async function updatePreferences(req, res) {
  try {
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Shallow merge the new preferences with the existing.
    user.preferences = { ...user.preferences, ...req.body.preferences };
    await user.save();
    res.json(user.preferences);
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

export async function resetPasswordInitiate(req, res) {
  try {
    const token = await generateToken();
    const user = await User.findByEmail(req.body.email);
    if (!user) {
      res.json({
        success: true,
        message:
          'If the email is registered with the editor, an email has been sent.'
      });
      return;
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const mailOptions = renderResetPassword({
      body: {
        domain: `${protocol}://${req.headers.host}`,
        link: `${protocol}://${req.headers.host}/reset-password/${token}`
      },
      to: user.email
    });

    await mailerService.send(mailOptions);
    res.json({
      success: true,
      message:
        'If the email is registered with the editor, an email has been sent.'
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false });
  }
}

export async function validateResetPasswordToken(req, res) {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }).exec();
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Password reset token is invalid or has expired.'
    });
    return;
  }
  res.json({ success: true });
}

export async function updatePassword(req, res) {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  }).exec();
  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Password reset token is invalid or has expired.'
    });
    return;
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  req.logIn(user, (loginErr) => res.json(userResponse(req.user)));
  // eventually send email that the password has been reset
}

/**
 * @param {string} username
 * @return {Promise<boolean>}
 */
export async function userExists(username) {
  const user = await User.findByUsername(username);
  return user != null;
}

/**
 * Updates the user object and sets the response.
 * Response is the user or a 500 error.
 * @param res
 * @param user
 */
export async function saveUser(res, user) {
  try {
    await user.save();
    res.json(userResponse(user));
  } catch (error) {
    res.status(500).json({ error });
  }
}

export async function updateSettings(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    user.username = req.body.username;

    if (req.body.newPassword) {
      if (user.password === undefined) {
        user.password = req.body.newPassword;
        saveUser(res, user);
      }
      if (!req.body.currentPassword) {
        res.status(401).json({ error: 'Current password is not provided.' });
        return;
      }
    }
    if (req.body.currentPassword) {
      const isMatch = await user.comparePassword(req.body.currentPassword);
      if (!isMatch) {
        res.status(401).json({ error: 'Current password is invalid.' });
        return;
      }
      user.password = req.body.newPassword;
      await saveUser(res, user);
    } else if (user.email !== req.body.email) {
      const EMAIL_VERIFY_TOKEN_EXPIRY_TIME = Date.now() + 3600000 * 24; // 24 hours
      user.verified = User.EmailConfirmation().Sent;

      user.email = req.body.email;

      const token = await generateToken();
      user.verifiedToken = token;
      user.verifiedTokenExpires = EMAIL_VERIFY_TOKEN_EXPIRY_TIME;

      await saveUser(res, user);

      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const mailOptions = renderEmailConfirmation({
        body: {
          domain: `${protocol}://${req.headers.host}`,
          link: `${protocol}://${req.headers.host}/verify?t=${token}`
        },
        to: user.email
      });

      await mailerService.send(mailOptions);
    } else {
      await saveUser(res, user);
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
}

export async function unlinkGithub(req, res) {
  if (req.user) {
    req.user.github = undefined;
    req.user.tokens = req.user.tokens.filter(
      (token) => token.kind !== 'github'
    );
    await saveUser(res, req.user);
    return;
  }
  res.status(404).json({
    success: false,
    message: 'You must be logged in to complete this action.'
  });
}

export async function unlinkGoogle(req, res) {
  if (req.user) {
    req.user.google = undefined;
    req.user.tokens = req.user.tokens.filter(
      (token) => token.kind !== 'google'
    );
    await saveUser(res, req.user);
    return;
  }
  res.status(404).json({
    success: false,
    message: 'You must be logged in to complete this action.'
  });
}

export async function updateCookieConsent(req, res) {
  try {
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { cookieConsent } = req.body;
    user.cookieConsent = cookieConsent;
    await saveUser(res, user);
  } catch (err) {
    res.status(500).json({ error: err });
  }
}
