import { Request } from 'express';
import { UserDocument } from './user';

/** Authenticated express request for routes that require auth. Has a user property */
export interface AuthenticatedRequest extends Request {
  user: UserDocument;
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
