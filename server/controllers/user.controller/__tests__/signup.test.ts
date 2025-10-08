import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { User } from '../../../models/user';
import {
  createUser,
  duplicateUserCheck,
  verifyEmail
} from '../../user.controller';

import { mailerService } from '../../../utils/mail';
import { renderEmailConfirmation } from '../../../views/mail';

jest.mock('../../../models/user');
jest.mock('../../../utils/mail', () => ({
  mailerService: {
    send: jest.fn()
  }
}));
jest.mock('../../../views/mail', () => ({
  renderEmailConfirmation: jest
    .fn()
    .mockReturnValue({ to: 'test@example.com', subject: 'Confirm' })
}));

describe('user.controller', () => {
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

  describe('createUser', () => {
    it('should return 422 if email already exists', async () => {
      User.findByEmailAndUsername = jest.fn().mockResolvedValue({
        email: 'existing@example.com',
        username: 'anyusername'
      });

      request.setBody({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password'
      });

      await createUser(request, response);

      expect(User.findByEmailAndUsername).toHaveBeenCalledWith(
        'existing@example.com',
        'testuser'
      );
      expect(response.status).toHaveBeenCalledWith(422);
      expect(response.send).toHaveBeenCalledWith({ error: 'Email is in use' });
    });
    it('should return 422 if username already exists', async () => {
      User.findByEmailAndUsername = jest.fn().mockResolvedValue({
        email: 'anyemail@example.com',
        username: 'testuser'
      });

      request.setBody({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password'
      });

      await createUser(request, response);

      expect(User.findByEmailAndUsername).toHaveBeenCalledWith(
        'existing@example.com',
        'testuser'
      );
      expect(response.status).toHaveBeenCalledWith(422);
      expect(response.send).toHaveBeenCalledWith({
        error: 'Username is in use'
      });
    });
  });

  describe('duplicateUserCheck', () => {
    it('calls findByEmailOrUsername with the correct params', async () => {
      const mockFind = jest.fn().mockResolvedValue(null);
      User.findByEmailOrUsername = mockFind;

      request.query = { check_type: 'email', email: 'test@example.com' };

      await duplicateUserCheck(request, response);

      expect(mockFind).toHaveBeenCalledWith('test@example.com', {
        caseInsensitive: true,
        valueType: 'email'
      });
    });

    it('returns the correct response body when no matching user is found', async () => {
      User.findByEmailOrUsername = jest.fn().mockResolvedValue(null);

      request.query = { check_type: 'username', username: 'newuser' };

      await duplicateUserCheck(request, response);

      expect(response.json).toHaveBeenCalledWith({
        exists: false,
        type: 'username'
      });
    });

    it('returns the correct response body when the username already exists', async () => {
      User.findByEmailOrUsername = jest.fn().mockResolvedValue({
        username: 'existinguser'
      });

      request.query = { check_type: 'username', username: 'existinguser' };

      await duplicateUserCheck(request, response);

      expect(response.json).toHaveBeenCalledWith({
        exists: true,
        message: 'This username is already taken.',
        type: 'username'
      });
    });

    it('returns the correct response body when the email already exists', async () => {
      User.findByEmailOrUsername = jest.fn().mockResolvedValue({
        email: 'existing@example.com'
      });

      request.query = { check_type: 'email', email: 'existing@example.com' };

      await duplicateUserCheck(request, response);

      expect(response.json).toHaveBeenCalledWith({
        exists: true,
        message: 'This email is already taken.',
        type: 'email'
      });
    });
  });

  describe('verifyEmail', () => {
    it('returns 401 if token is invalid or expired', async () => {
      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });

      request.query = { t: 'invalidtoken' };

      await verifyEmail(request, response);

      expect(User.findOne).toHaveBeenCalledWith({
        verifiedToken: 'invalidtoken',
        verifiedTokenExpires: { $gt: expect.any(Date) }
      });
      expect(response.status).toHaveBeenCalledWith(401);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token is invalid or has expired.'
      });
    });

    it('verifies the user and returns success if token is valid', async () => {
      const saveMock = jest.fn().mockResolvedValue({});
      const mockUser = {
        save: saveMock,
        verified: 'verified',
        verifiedToken: 'validtoken',
        verifiedTokenExpires: new Date(Date.now() + 10000)
      };

      User.EmailConfirmation = jest.fn().mockReturnValue({
        Verified: 'verified'
      });

      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      });

      request.query = { t: 'validtoken' };

      await verifyEmail(request, response);

      expect(mockUser.verified).toBe('verified');
      expect(mockUser.verifiedToken).toBeNull();
      expect(mockUser.verifiedTokenExpires).toBeNull();
      expect(saveMock).toHaveBeenCalled();
      expect(response.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
