import { RequestHandler } from 'express';
import { User } from '../../models/user';
import {
  Error,
  UserPreferences,
  PublicUser,
  CookieConsentOptions
} from '../../types';
import { saveUser } from './helpers';

export interface UpdatePreferencesRequestBody {
  preferences: UserPreferences;
}
export interface UpdateCookieConsentRequestBody {
  cookieConsent: CookieConsentOptions;
}

export const updatePreferences: RequestHandler<
  {},
  UserPreferences | Error,
  UpdatePreferencesRequestBody
> = async (req, res) => {
  try {
    const user = await User.findById(req.user!.id).exec();
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
};

export const updateCookieConsent: RequestHandler<
  {},
  PublicUser | Error,
  UpdateCookieConsentRequestBody
> = async (req, res) => {
  try {
    const user = await User.findById(req.user!.id).exec();
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
};
