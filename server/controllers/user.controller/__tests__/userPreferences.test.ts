import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { User } from '../../../models/user';
import { updatePreferences, updateCookieConsent } from '../userPreferences';
import { createMockUser, mockUserPreferences } from '../__testUtils__';
import {
  AppThemeOptions,
  CookieConsentOptions,
  PublicUser
} from '../../../types';

jest.mock('../../../models/user');

const mockBaseUser = createMockUser();

describe('user.controller > user preferences', () => {
  let request: any;
  let response: any;
  let next: MockNext;
  let mockUser: PublicUser & Record<string, any>;

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

  describe('updatePreferences', () => {
    it('saves user preferences when user exists', async () => {
      mockUser = createMockUser({
        preferences: { ...mockUserPreferences, theme: AppThemeOptions.LIGHT },
        save: jest.fn().mockResolvedValue(null)
      });

      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      request.user = { id: 'user1' };
      request.body = {
        preferences: { theme: AppThemeOptions.DARK, notifications: true }
      };

      await updatePreferences(request, response, next);

      // Check that preferences were merged correctly
      expect(mockUser.preferences).toEqual({
        ...mockUserPreferences,
        theme: AppThemeOptions.DARK,
        notifications: true
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(response.json).toHaveBeenCalledWith(mockUser.preferences);
    });
    it('returns 404 when no user is found', async () => {
      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      request.user = { id: 'nonexistentid' };

      await updatePreferences(request, response, next);

      expect(User.findById).toHaveBeenCalledWith('nonexistentid');
      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
    it('returns 500 if saving preferences fails', async () => {
      mockUser = createMockUser({
        preferences: { ...mockUserPreferences, theme: AppThemeOptions.LIGHT },
        save: jest.fn().mockRejectedValue(new Error('DB error'))
      });

      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      request.user = { id: 'user1' };
      request.body = { preferences: { theme: 'dark' } };

      await updatePreferences(request, response, next);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({ error: expect.any(Error) });
    });
  });

  describe('updateCookieConsent', () => {
    it('updates cookieConsent when user exists', async () => {
      mockUser = createMockUser({
        cookieConsent: CookieConsentOptions.ALL,
        save: jest.fn().mockResolvedValue(null)
      });
      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      request.user = { id: 'user1' };
      request.body = { cookieConsent: CookieConsentOptions.ESSENTIAL };

      await updateCookieConsent(request, response, next);

      expect(User.findById).toHaveBeenCalledWith('user1');
      expect(mockUser.cookieConsent).toBe(CookieConsentOptions.ESSENTIAL);
      expect(mockUser.save).toHaveBeenCalled();
      expect(response.json).toHaveBeenCalledWith({
        ...mockBaseUser,
        cookieConsent: CookieConsentOptions.ESSENTIAL
      });
    });

    it('returns 404 when no user is found', async () => {
      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      request.user = { id: 'nonexistentid' };
      request.body = { cookieConsent: true };

      await updateCookieConsent(request, response, next);

      expect(User.findById).toHaveBeenCalledWith('nonexistentid');
      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('returns 500 if saving cookieConsent fails', async () => {
      mockUser = createMockUser({
        cookieConsent: CookieConsentOptions.ALL,
        save: jest.fn().mockRejectedValue(new Error('DB error'))
      });

      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      request.user = { id: 'user1' };
      request.body = { cookieConsent: true };

      await updateCookieConsent(request, response, next);

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({ error: expect.any(Error) });
    });
  });
});
