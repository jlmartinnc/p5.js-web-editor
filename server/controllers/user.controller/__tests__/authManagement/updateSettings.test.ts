import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { User } from '../../../../models/user';
import { updateSettings } from '../../authManagement';
import { saveUser, generateToken, userResponse } from '../../helpers';
import { createMockUser } from '../../__testUtils__';

import { mailerService } from '../../../../utils/mail';
import { UserDocument } from '../../../../types';

jest.mock('../../../../models/user');
jest.mock('../../../../utils/mail', () => ({
  mailerService: {
    send: jest.fn()
  }
}));
jest.mock('../../helpers', () => ({
  ...jest.requireActual('../../helpers'),
  saveUser: jest.fn(),
  generateToken: jest.fn()
}));

describe('user.controller > auth management', () => {
  let request: any;
  let response: any;
  let next: MockNext;
  const fixedTime = 100000000;

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

  describe('updateSettings', () => {
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

        (saveUser as jest.Mock).mockResolvedValue(null);
        (generateToken as jest.Mock).mockResolvedValue('token12343');

        await updateSettings(request, response, next);
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
      const startingUser = createMockUser({
        username: 'oldusername',
        email: 'old@email.com',
        id: 'valid-id',
        comparePassword: jest.fn().mockResolvedValue(true)
      });

      beforeEach(() => {
        User.findById = jest.fn().mockResolvedValue(startingUser);

        request.user = { id: 'valid-id' };

        (saveUser as jest.Mock).mockResolvedValue(null);
        (generateToken as jest.Mock).mockResolvedValue('token12343');
      });

      describe('and when there is a username in the request', () => {
        beforeEach(async () => {
          request.setBody({
            username: 'newusername'
          });
          await updateSettings(request, response, next);
        });
        it('calls saveUser', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            username: 'newusername'
          });
        });
      });

      // currently frontend doesn't seem to call the below
      describe('and when there is a newPassword in the request', () => {
        beforeEach(async () => {});
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
});
