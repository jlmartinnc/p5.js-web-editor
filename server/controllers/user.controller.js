import { User } from '../models/user';
import { mailerService } from '../utils/mail';
import { renderEmailConfirmation, renderResetPassword } from '../views/mail';

import {
  userResponse,
  generateToken,
  saveUser
} from './user.controller/helpers';

export * from './user.controller/apiKey';
export * from './user.controller/signup';
export * from './user.controller/userPreferences';
export * from './user.controller/authManagement';

/**
 * @param {string} username
 * @return {Promise<boolean>}
 */
export async function userExists(username) {
  const user = await User.findByUsername(username);
  return user != null;
}
