import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { User } from '../../../models/user';
import {
  resetPasswordInitiate,
  validateResetPasswordToken,
  unlinkGithub,
  unlinkGoogle
} from '../../user.controller';
import { saveUser, generateToken } from '../helpers';

import { mailerService } from '../../../utils/mail';
import {
  renderEmailConfirmation,
  renderResetPassword
} from '../../../views/mail';
import { UserDocument } from '../../../types';

jest.mock('../../../models/user');
jest.mock('../../../utils/mail', () => ({
  mailerService: {
    send: jest.fn()
  }
}));
// jest.mock('../../../views/mail', () => ({
//   renderEmailConfirmation: jest
//     .fn()
//     .mockReturnValue({ to: 'test@example.com', subject: 'Confirm' }),
//   renderResetPassword: jest
//     .fn()
//     .mockReturnValue({ to: 'test@example.com', subject: 'Reset password' })
// }));
jest.mock('../helpers', () => ({
  saveUser: jest.fn(),
  generateToken: jest.fn()
}));

describe('user.controller > 3rd party auth management', () => {
  let request: any;
  let response: any;
  let next: MockNext;

  beforeEach(() => {
    request = new MockRequest();
    response = new MockResponse();
    next = jest.fn();
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
    jest.clearAllMocks();
  });

  describe('resetPasswordInitiate', () => {
    const fixedTime = 100000000; // arbitrary fixed timestamp
    let mockToken: string;
    let saveMock: jest.Mock;
    let mockUser: Partial<UserDocument>;

    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(fixedTime);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    describe('if the user is found', () => {
      beforeEach(() => {
        mockToken = 'mock-token';
        saveMock = jest.fn().mockResolvedValue({});
        mockUser = {
          email: 'test@example.com',
          save: saveMock
        };

        (generateToken as jest.Mock).mockResolvedValue(mockToken);
        User.findByEmail = jest.fn().mockResolvedValue(mockUser);

        request.body = { email: 'test@example.com' };
        request.headers.host = 'localhost:3000';
      });
      it('sets a resetPasswordToken with an expiry of 1h to the user', async () => {
        await resetPasswordInitiate(request, response, next);

        expect(mockUser.resetPasswordToken).toBe(mockToken);
        expect(mockUser.resetPasswordExpires).toBe(fixedTime + 3600000);
        expect(saveMock).toHaveBeenCalled();
      });
      it('sends the reset password email', async () => {
        await resetPasswordInitiate(request, response, next);

        expect(mailerService.send).toHaveBeenCalledWith(
          expect.objectContaining({
            to: 'test@example.com',
            body: expect.objectContaining({
              link: expect.stringContaining(mockToken)
            })
          })
        );
      });
      it('returns a success message that does not indicate if the user exists, for security purposes', async () => {
        await resetPasswordInitiate(request, response, next);

        expect(response.json).toHaveBeenCalledWith({
          success: true,
          message:
            'If the email is registered with the editor, an email has been sent.'
        });
      });
    });
    describe('if the user is not found', () => {
      beforeEach(() => {
        mockToken = 'mock-token';
        saveMock = jest.fn().mockResolvedValue({});
        mockUser = {
          email: 'test@example.com',
          save: saveMock
        };

        (generateToken as jest.Mock).mockResolvedValue(mockToken);
        User.findByEmail = jest.fn().mockResolvedValue(null);

        request.body = { email: 'test@example.com' };
        request.headers.host = 'localhost:3000';
      });
      it('does not send the reset password email', async () => {
        await resetPasswordInitiate(request, response, next);

        expect(mailerService.send).not.toHaveBeenCalledWith();
      });
      it('returns a success message that does not indicate if the user exists, for security purposes', async () => {
        await resetPasswordInitiate(request, response, next);

        expect(response.json).toHaveBeenCalledWith({
          success: true,
          message:
            'If the email is registered with the editor, an email has been sent.'
        });
      });
    });
    it('returns unsuccessful for all other errors', async () => {
      mockToken = 'mock-token';
      saveMock = jest.fn().mockResolvedValue({});
      mockUser = {
        email: 'test@example.com',
        save: saveMock
      };

      (generateToken as jest.Mock).mockRejectedValue(
        new Error('network error')
      );
      User.findByEmail = jest.fn().mockResolvedValue(null);

      request.body = { email: 'test@example.com' };
      request.headers.host = 'localhost:3000';

      await resetPasswordInitiate(request, response, next);

      expect(response.json).toHaveBeenCalledWith({
        success: false
      });
    });
  });

  describe('validateResetPasswordToken', () => {
    const fixedTime = 100000000;
    beforeAll(() => jest.useFakeTimers().setSystemTime(fixedTime));
    afterAll(() => jest.useRealTimers());

    it('returns 401 if no user is found or token has expired', async () => {
      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      request.params = { token: 'invalid-token' };

      await validateResetPasswordToken(request, response);

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: 'invalid-token',
        resetPasswordExpires: { $gt: fixedTime }
      });
      expect(response.status).toHaveBeenCalledWith(401);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: 'Password reset token is invalid or has expired.'
      });
    });

    it('returns success if a user with a valid token is found', async () => {
      const fakeUser = {
        email: 'test@example.com',
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: fixedTime + 10000 // still valid
      };

      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(fakeUser)
      });

      request.params = { token: 'valid-token' };

      await validateResetPasswordToken(request, response);

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: 'valid-token',
        resetPasswordExpires: { $gt: fixedTime }
      });
      expect(response.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('unlinkGithub', () => {
    it('returns 404 if user is not logged in', async () => {
      await unlinkGithub(request, response, next);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: 'You must be logged in to complete this action.'
      });
    });
    it('removes the users github & filters out github tokens if user is logged in', async () => {
      const user = {
        github: { id: '123', username: 'testuser' },
        tokens: [
          { kind: 'github', accessToken: 'abc' },
          { kind: 'google', accessToken: 'xyz' }
        ]
      };

      request.user = user;

      await unlinkGithub(request, response, next);

      expect(user.github).toBeUndefined();
      expect(user.tokens).toEqual([{ kind: 'google', accessToken: 'xyz' }]);
      expect(saveUser).toHaveBeenCalledWith(response, user);
    });
  });

  describe('unlinkGoogle', () => {
    it('returns 404 if user is not logged in', async () => {
      await unlinkGoogle(request, response, next);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: 'You must be logged in to complete this action.'
      });
    });
    it('removes the users google & filters out google tokens if user is logged in', async () => {
      const user = {
        google: { id: '123', username: 'testuser' },
        tokens: [
          { kind: 'github', accessToken: 'abc' },
          { kind: 'google', accessToken: 'xyz' }
        ]
      };

      request.user = user;

      await unlinkGoogle(request, response, next);

      expect(user.google).toBeUndefined();
      expect(user.tokens).toEqual([{ kind: 'github', accessToken: 'abc' }]);
      expect(saveUser).toHaveBeenCalledWith(response, user);
    });
  });
});
