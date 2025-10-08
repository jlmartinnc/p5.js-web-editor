/* eslint-disable no-unused-vars */
import crypto from 'crypto';

import { Types } from 'mongoose';
import { userResponse, generateToken } from '../helpers';
import { CookieConsentOptions, AppThemeOptions } from '../../../types';
import { ApiKeyDocument } from '../../../types';

jest.mock('../../../models/user');

const mockFullUser = {
  email: 'test@example.com',
  username: 'tester',
  preferences: {
    fontSize: 12,
    lineNumbers: false,
    indentationAmount: 10,
    isTabIndent: false,
    autosave: false,
    linewrap: false,
    lintWarning: false,
    textOutput: false,
    gridOutput: false,
    theme: AppThemeOptions.CONTRAST,
    autorefresh: false,
    language: 'en-GB',
    autocloseBracketsQuotes: false,
    autocompleteHinter: false
  },
  apiKeys: ([] as unknown) as Types.DocumentArray<ApiKeyDocument>,
  verified: 'verified',
  id: 'abc123',
  totalSize: 42,
  cookieConsent: CookieConsentOptions.NONE,
  google: 'user@gmail.com',
  github: 'user123',

  // to be removed:
  name: 'test user',
  tokens: [],
  password: 'abweorij',
  resetPasswordToken: '1i14ij23',
  banned: false
};

describe('user.helpers', () => {
  describe('userResponse', () => {
    it('returns a sanitized PublicUser object', () => {
      const result = userResponse(mockFullUser);

      const {
        password,
        resetPasswordToken,
        banned,
        ...sanitised
      } = mockFullUser;

      expect(result).toMatchObject(sanitised);
    });
  });

  describe('generateToken', () => {
    it('generates a random hex string of length 40', async () => {
      const token = await generateToken();
      expect(typeof token).toBe('string');
      expect(token).toMatch(/^[a-f0-9]+$/);
      expect(token).toHaveLength(40);
    });

    it('rejects if crypto.randomBytes errors', async () => {
      const spy = jest
        .spyOn(crypto, 'randomBytes')
        .mockImplementationOnce((_size, cb) => {
          cb(new Error('fail'), Buffer.alloc(0));
          return {};
        });

      await expect(generateToken()).rejects.toThrow('fail');

      spy.mockRestore();
    });
  });
});
