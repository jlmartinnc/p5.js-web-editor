/* eslint-disable no-unused-vars */
import crypto from 'crypto';

import { userResponse, generateToken } from '../helpers';
import { createMockUser } from '../__testUtils__';

jest.mock('../../../models/user');

const mockFullUser = createMockUser({
  // sensitive fields to be removed:
  name: 'bob dylan',
  tokens: [],
  password: 'password12314',
  resetPasswordToken: 'wijroaijwoer',
  banned: true
});

describe('user.controller > helpers', () => {
  describe('userResponse', () => {
    it('returns a sanitized PublicUser object', () => {
      const result = userResponse(mockFullUser);

      const {
        name,
        tokens,
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
