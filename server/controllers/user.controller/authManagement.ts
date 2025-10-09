import { RequestHandler } from 'express';
import * as core from 'express-serve-static-core';
import { User } from '../../models/user';
import { saveUser, generateToken } from './helpers';
import { PublicUser, GenericResponseBody } from '../../types';
import { mailerService } from '../../utils/mail';
import { renderResetPassword } from '../../views/mail';

export interface ResetPasswordRequestBody {
  email: string;
}
export interface ValidateResetPasswordRequestParams
  extends core.ParamsDictionary {
  token: string;
}

export const resetPasswordInitiate: RequestHandler<
  {},
  GenericResponseBody,
  ResetPasswordRequestBody
> = async (req, res) => {
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
};

export const validateResetPasswordToken: RequestHandler<ValidateResetPasswordRequestParams> = async (
  req,
  res
) => {
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
};

export const unlinkGithub: RequestHandler<
  {},
  PublicUser | Error | GenericResponseBody
> = async (req, res) => {
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
};

export const unlinkGoogle: RequestHandler<
  {},
  PublicUser | Error | GenericResponseBody
> = async (req, res) => {
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
};
