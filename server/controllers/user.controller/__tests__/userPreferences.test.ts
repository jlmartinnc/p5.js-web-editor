import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { User } from '../../../models/user';
import { updatePreferences } from '../../user.controller';

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

describe('user.controller > user preferences', () => {
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

  describe('updatePreferences', () => {
    it('saves user preferences when user exists', async () => {
      const saveMock = jest.fn().mockResolvedValue({});
      const mockUser = {
        preferences: { theme: 'light' },
        save: saveMock
      };
      User.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockUser) });

      request.user = { id: 'user1' };
      request.body = { preferences: { theme: 'dark', notifications: true } };

      await updatePreferences(request, response, next);

      // Check that preferences were merged correctly
      expect(mockUser.preferences).toEqual({
        theme: 'dark',
        notifications: true
      });
      expect(saveMock).toHaveBeenCalled();
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
      const saveMock = jest.fn().mockRejectedValue(new Error('DB error'));
      const mockUser = {
        preferences: { theme: 'light' },
        save: saveMock
      };
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
});
