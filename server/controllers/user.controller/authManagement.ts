import { RequestHandler } from 'express';
import { saveUser } from './helpers';
import { PublicUser, GenericResponseBody } from '../../types';

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
