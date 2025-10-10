import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { User } from '../../../../models/user';
import { updateSettings } from '../../authManagement';
import { saveUser, generateToken } from '../../helpers';
import { createMockUser } from '../../__testUtils__';

import { mailerService } from '../../../../utils/mail';
import { UpdateSettingsRequestBody, UserDocument } from '../../../../types';

jest.mock('../../../../models/user');
jest.mock('../../../../utils/mail');
jest.mock('../../../../views/mail');
jest.mock('../../helpers', () => ({
  ...jest.requireActual('../../helpers'), // use actual userResponse
  saveUser: jest.fn(),
  generateToken: jest.fn()
}));

describe('user.controller > auth management > updateSettings (email, username, password)', () => {
  let request: any;
  let response: any;
  let next: MockNext;
  let requestBody: UpdateSettingsRequestBody;
  let startingUser: Partial<UserDocument>;

  const fixedTime = 100000000;
  const GENERATED_TOKEN = 'new-token-1io23jijo';

  const OLD_USERNAME = 'oldusername';
  const NEW_USERNAME = 'newusername';

  const OLD_EMAIL = 'old@email.com';
  const NEW_EMAIL = 'new@email.com';

  const OLD_PASSWORD = 'oldpassword';
  const NEW_PASSWORD = 'newpassword';

  // minimum valid request body to manipulate per test
  // from manual testing on the account form:
  // both username and email are required & there is client-side validation for valid email & username-taken prior to submit
  const minimumValidRequest: UpdateSettingsRequestBody = {
    username: OLD_USERNAME,
    email: OLD_EMAIL
  };

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(fixedTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    request = new MockRequest();
    response = new MockResponse();
    next = jest.fn();

    startingUser = createMockUser({
      username: OLD_USERNAME,
      email: OLD_EMAIL,
      password: OLD_PASSWORD,
      id: '123459',
      comparePassword: jest.fn().mockResolvedValue(true)
    });

    User.findById = jest.fn().mockResolvedValue(startingUser);
    User.EmailConfirmation = jest.fn().mockReturnValue({ Sent: 'sent' });
    (saveUser as jest.Mock).mockResolvedValue(null);
    (generateToken as jest.Mock).mockResolvedValue(GENERATED_TOKEN);
    (mailerService.send as jest.Mock).mockResolvedValue(true);

    request.user = { id: 'valid-id' };
    request.headers.host = 'localhost:3000';
  });

  afterEach(() => {
    request.resetMocked();
    response.resetMocked();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('if the user is not found', () => {
    beforeEach(async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);
      request.user = { id: 'nonexistent-id' };

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
    // Q: should we add check & logic that if no username or email are on the request,
    // we fallback to the username and/or email on the found user for safety?
    // not sure if anyone is hitting this api directly, so the client-side checks may not be enough

    // duplicate username check happens client-side before this request is made
    it('saves the user with any username in the request', async () => {
      // saves with old username
      requestBody = { ...minimumValidRequest, username: OLD_USERNAME };
      request.setBody(requestBody);
      await updateSettings(request, response, next);
      expect(saveUser).toHaveBeenCalledWith(response, { ...startingUser });

      // saves with new username
      requestBody = { ...minimumValidRequest, username: NEW_USERNAME };
      request.setBody(requestBody);
      await updateSettings(request, response, next);
      expect(saveUser).toHaveBeenCalledWith(response, {
        ...startingUser,
        username: NEW_USERNAME
      });
    });

    // currently frontend doesn't seem to call password-change related things the below
    // not sure if we should update the logic to be cleaner?
    describe('when there is a new password in the request', () => {
      describe('and the current password is not provided', () => {
        beforeEach(async () => {
          requestBody = { ...minimumValidRequest, newPassword: NEW_PASSWORD };
          request.setBody(requestBody);
          await updateSettings(request, response, next);
        });

        it('returns 401 with a "current password not provided" message', () => {
          expect(response.status).toHaveBeenCalledWith(401);
          expect(response.json).toHaveBeenCalledWith({
            error: 'Current password is not provided.'
          });
        });

        it('does not save the user with the new password', () => {
          expect(saveUser).not.toHaveBeenCalled();
        });
      });
    });

    // this should be nested in the previous block but currently here to match existing logic as-is
    // NOTE: will make a PR into this branch to propose the change
    describe('and when there is a currentPassword in the request', () => {
      describe('and the current password does not match', () => {
        beforeEach(async () => {
          startingUser.comparePassword = jest.fn().mockResolvedValue(false);

          requestBody = {
            ...minimumValidRequest,
            newPassword: NEW_PASSWORD,
            currentPassword: 'WRONG_PASSWORD'
          };

          request.setBody(requestBody);
          await updateSettings(request, response, next);
        });

        it('returns 401 with a "current password invalid" message', () => {
          expect(response.status).toHaveBeenCalledWith(401);
          expect(response.json).toHaveBeenCalledWith({
            error: 'Current password is invalid.'
          });
        });
        it('does not save the user with the new password', () => {
          expect(saveUser).not.toHaveBeenCalled();
        });
      });

      describe('and when the current password does match', () => {
        beforeEach(async () => {
          startingUser.comparePassword = jest.fn().mockResolvedValue(true);

          requestBody = {
            ...minimumValidRequest,
            newPassword: NEW_PASSWORD,
            currentPassword: OLD_PASSWORD
          };
          request.setBody(requestBody);

          await updateSettings(request, response, next);
        });
        it('calls saveUser with the new password', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            password: NEW_PASSWORD
          });
        });
      });

      // NOTE: This should not pass, but it currently does!!
      describe('and when there is no new password on the request', () => {
        beforeEach(async () => {
          startingUser.comparePassword = jest.fn().mockResolvedValue(true);

          requestBody = {
            ...minimumValidRequest,
            newPassword: undefined,
            currentPassword: OLD_PASSWORD
          };
          request.setBody(requestBody);

          await updateSettings(request, response, next);
        });
        it('calls saveUser with the new empty password', () => {
          expect(saveUser).toHaveBeenCalledWith(response, {
            ...startingUser,
            password: undefined
          });
        });
      });
    });

    describe('and when there is an email in the request', () => {
      it('does not send a verification email if email is unchanged', async () => {
        requestBody = minimumValidRequest;
        request.setBody(requestBody);
        await updateSettings(request, response, next);

        expect(saveUser).toHaveBeenCalledWith(response, startingUser);
        expect(mailerService.send).not.toHaveBeenCalled();
      });

      it('updates email and sends verification email if email is changed', async () => {
        requestBody = { ...minimumValidRequest, email: NEW_EMAIL };
        request.setBody(requestBody);
        await updateSettings(request, response, next);

        expect(saveUser).toHaveBeenCalledWith(response, {
          ...startingUser,
          email: NEW_EMAIL,
          verified: 'sent',
          verifiedToken: GENERATED_TOKEN
        });

        expect(mailerService.send).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: 'Mock confirm your email'
          })
        );
      });
    });

    describe('and when there is any other error', () => {
      beforeEach(async () => {
        User.findById = jest.fn().mockRejectedValue('db error');
        requestBody = minimumValidRequest;
        request.setBody(requestBody);
        await updateSettings(request, response, next);
      });
      it('returns a 500 error', () => {
        expect(response.status).toHaveBeenCalledWith(500);
        expect(response.json).toHaveBeenCalledWith({ error: 'db error' });
      });
    });
  });
});
