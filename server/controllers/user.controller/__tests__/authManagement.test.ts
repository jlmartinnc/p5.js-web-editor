import { Request as MockRequest } from 'jest-express/lib/request';
import { Response as MockResponse } from 'jest-express/lib/response';
import { NextFunction as MockNext } from 'jest-express/lib/next';
import { User } from '../../../models/user';
import { unlinkGithub, unlinkGoogle } from '../../user.controller';

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
    it('returns 404 if user is not found', async () => {
      await unlinkGithub(request, response);

      expect(response.status).toHaveBeenCalledWith(404);
      expect(response.json).toHaveBeenCalledWith({
        success: false,
        message: 'You must be logged in to complete this action.'
      });
    });
  });
});
