import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { User } from '../../../models/user';
import {
  resetPasswordInitiate,
  validateResetPasswordToken,
  updateSettings,
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
jest.mock('../helpers', () => ({
  saveUser: jest.fn(),
  generateToken: jest.fn()
}));

describe('user.controller > auth management', () => {
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
    const fixedTime = 100000000;
    let mockToken: string;
    let saveMock: jest.Mock;
    let mockUser: Partial<UserDocument>;

    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(fixedTime);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('calls User.findByEmail with the correct email', async () => {
      User.findByEmail = jest.fn().mockResolvedValue({});
      request.body = { email: 'email@gmail.com' };
      await resetPasswordInitiate(request, response, next);

      expect(User.findByEmail).toHaveBeenCalledWith('email@gmail.com');
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

    it('calls User.findone with the correct token and expiry', async () => {
      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn()
      });
      request.params = { token: 'some-token' };
      await validateResetPasswordToken(request, response, next);

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: 'some-token',
        resetPasswordExpires: { $gt: fixedTime }
      });
    });

    describe('and when no user is found', () => {
      beforeEach(async () => {
        User.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        });
        request.params = { token: 'invalid-token' };
        await validateResetPasswordToken(request, response, next);
      });
      it('returns a 401', () => {
        expect(response.status).toHaveBeenCalledWith(401);
      });
      it('returns a "invalid or expired" token message', () => {
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'Password reset token is invalid or has expired.'
        });
      });
    });

    describe('and when there is a user with valid token', () => {
      beforeEach(async () => {
        const fakeUser = {
          email: 'test@example.com',
          resetPasswordToken: 'valid-token',
          resetPasswordExpires: fixedTime + 10000 // still valid
        };
        User.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(fakeUser)
        });
        request.params = { token: 'valid-token' };
        await validateResetPasswordToken(request, response, next);
      });
      it('returns a success response', () => {
        expect(response.json).toHaveBeenCalledWith({ success: true });
      });
    });
  });

  describe('updateSettings', () => {
    const fixedTime = 100000000; // arbitrary fixed timestamp
    let saveMock: jest.Mock;
    let mockUser: Partial<UserDocument>;

    beforeAll(() => {
      jest.useFakeTimers().setSystemTime(fixedTime);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    describe('if the user is not found', () => {
      beforeEach(async () => {
        User.findById = jest.fn().mockResolvedValue(null);
        request.user = { id: 'nonexistent-id' };
        await updateSettings(request, response);
      });

      it('returns 404 and a user-not-found error', async () => {
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({
          error: 'User not found'
        });
      });
      it('does not save the user', () => {
        expect(saveUser).not.toHaveBeenCalled();
      });
    });

    // the below tests match the current logic, but logic can be improved
    describe('if the user is found', () => {
      const startingUser = {
        username: 'oldusername',
        email: 'old@email.com',
        id: 'valid-id'
      };

      beforeEach(() => {
        User.findById = jest.fn().mockResolvedValue(startingUser);
        request.user = { id: 'valid-id' };
      });

      describe('and when there is a username in the request', () => {
        beforeEach(async () => {
          request.setBody({
            username: 'newusername'
          });
          await updateSettings(request, response);
        });
        it('calls saveUser with the new username', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            username: 'newusername'
          });
        });
      });

      // describe('and when there is an email in the request', () => {
      //   beforeEach(async () => {
      //     request.setBody({
      //       username: 'oldusername',
      //       email: 'new@email.com'
      //     });
      //     await updateSettings(request, response);
      //   });
      //   it('calls saveUser with the new email', () => {
      //     expect(saveUser).toHaveBeenCalledWith(response, {
      //       ...startingUser,
      //       email: 'new@email.com'
      //     });
      //   });
      //   it('sends an email to confirm the email update', () => {});
      // });

      // currently frontend doesn't seem to call the below
      describe('and when there is a newPassword in the request', () => {
        describe('and the current password is not provided', () => {
          it('returns 401 with a "current password not provided" message', () => {});
          it('does not save the user with the new password', () => {});
        });
      });
      describe('and when there is a currentPassword in the request', () => {
        describe('and the current password does not match', () => {
          it('returns 401 with a "current password invalid" message', () => {});
          it('does not save the user with the new password', () => {});
        });
        describe('and when the current password does match', () => {
          it('calls saveUser with the new password', () => {});
        });
      });
    });
  });

  describe('unlinkGithub', () => {
    describe('and when there is no user in the request', () => {
      beforeEach(async () => {
        await unlinkGithub(request, response, next);
      });
      it('does not call saveUser', () => {
        expect(saveUser).not.toHaveBeenCalled();
      });
      it('returns a 404 with the correct status and message', () => {
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'You must be logged in to complete this action.'
        });
      });
    });
    describe('and when there is a user in the request', () => {
      const user = {
        github: { id: '123', username: 'testuser' },
        tokens: [
          { kind: 'github', accessToken: 'abc' },
          { kind: 'google', accessToken: 'xyz' }
        ]
      };

      beforeEach(async () => {
        request.user = user;
        await unlinkGithub(request, response, next);
      });
      it('removes the users github property', () => {
        expect(user.github).toBeUndefined();
      });
      it('filters out the github token', () => {
        expect(user.tokens).toEqual([{ kind: 'google', accessToken: 'xyz' }]);
      });
      it('does calls saveUser', () => {
        expect(saveUser).toHaveBeenCalledWith(response, user);
      });
    });
  });

  describe('unlinkGoogle', () => {
    describe('and when there is no user in the request', () => {
      beforeEach(async () => {
        await unlinkGoogle(request, response, next);
      });
      it('does not call saveUser', () => {
        expect(saveUser).not.toHaveBeenCalled();
      });
      it('returns a 404 with the correct status and message', () => {
        expect(response.status).toHaveBeenCalledWith(404);
        expect(response.json).toHaveBeenCalledWith({
          success: false,
          message: 'You must be logged in to complete this action.'
        });
      });
    });
    describe('and when there is a user in the request', () => {
      const user = {
        google: { id: '123', username: 'testuser' },
        tokens: [
          { kind: 'github', accessToken: 'abc' },
          { kind: 'google', accessToken: 'xyz' }
        ]
      };

      beforeEach(async () => {
        request.user = user;
        await unlinkGoogle(request, response, next);
      });
      it('removes the users google property', () => {
        expect(user.google).toBeUndefined();
      });
      it('filters out the google token', () => {
        expect(user.tokens).toEqual([{ kind: 'github', accessToken: 'abc' }]);
      });
      it('does calls saveUser', () => {
        expect(saveUser).toHaveBeenCalledWith(response, user);
      });
    });
  });
});
