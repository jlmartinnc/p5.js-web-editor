import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { User } from '../../../models/user';
import { unlinkGithub, unlinkGoogle } from '../../user.controller';
import { saveUser } from '../helpers';

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
jest.mock('../helpers', () => ({
  saveUser: jest.fn()
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

  describe('unlinkGithub', () => {
    it('returns 404 if user is not logged in', async () => {
      await unlinkGithub(request, response);

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

      await unlinkGithub(request, response);

      expect(user.github).toBeUndefined();
      expect(user.tokens).toEqual([{ kind: 'google', accessToken: 'xyz' }]);
      expect(saveUser).toHaveBeenCalledWith(response, user);
    });
  });

  describe('unlinkGoogle', () => {
    it('returns 404 if user is not logged in', async () => {
      await unlinkGoogle(request, response);

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

      await unlinkGoogle(request, response);

      expect(user.google).toBeUndefined();
      expect(user.tokens).toEqual([{ kind: 'github', accessToken: 'abc' }]);
      expect(saveUser).toHaveBeenCalledWith(response, user);
    });
  });
});
