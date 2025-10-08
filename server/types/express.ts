import { Request } from 'express';
import { User } from './user';

// workaround for express.d.ts not working as expected
/** Express Request with an user property. Used for routes that require authentication. */
export interface AuthenticatedRequest extends Request {
  user: User;
}

/** Simple error object for express requests */
export interface Error {
  error: string | unknown;
}

/** Simple response object for express requests with success status and optional message */
export interface GenericResponseBody {
  success: boolean;
  message?: string;
}
