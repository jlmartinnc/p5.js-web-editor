import { Document, Model, Types } from 'mongoose';
import * as core from 'express-serve-static-core';
import { VirtualId, MongooseTimestamps } from './mongoose';
import { UserPreferences, CookieConsentOptions } from './userPreferences';
import { EmailConfirmationStates } from './email';
import { ApiKeyDocument } from './apiKey';
import { Error, GenericResponseBody } from './express';

/** Full User interface */
export interface IUser extends VirtualId, MongooseTimestamps {
  name: string;
  username: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  verified?: string;
  verifiedToken?: string | null;
  verifiedTokenExpires?: number | null;
  github?: string;
  google?: string;
  email: string;
  tokens: { kind: string }[];
  apiKeys: Types.DocumentArray<ApiKeyDocument>;
  preferences: UserPreferences;
  totalSize: number;
  cookieConsent: CookieConsentOptions;
  banned: boolean;
  lastLoginTimestamp?: Date;
}

/** User object which can be exposed to the client */
export interface User extends IUser {}

/** Sanitised version of the user document without sensitive info */
export interface PublicUser
  extends Pick<
    UserDocument,
    | 'email'
    | 'username'
    | 'preferences'
    | 'apiKeys'
    | 'verified'
    | 'id'
    | 'totalSize'
    | 'github'
    | 'google'
    | 'cookieConsent'
  > {}

/** Mongoose document object for User */
export interface UserDocument
  extends IUser,
    Omit<Document<Types.ObjectId>, 'id'> {
  comparePassword(candidatePassword: string): Promise<boolean>;
  findMatchingKey(
    candidateKey: string
  ): Promise<{ isMatch: boolean; keyDocument: ApiKeyDocument | null }>;
}

/** Mongoose model for User */
export interface UserModel extends Model<UserDocument> {
  findByEmail(email: string | string[]): Promise<UserDocument | null>;
  findAllByEmails(emails: string[]): Promise<UserDocument[] | null>;
  findByUsername(
    username: string,
    options?: { caseInsensitive: boolean }
  ): Promise<UserDocument | null>;
  findByEmailOrUsername(
    value: string,
    options?: { caseInsensitive: boolean; valueType: 'email' | 'username' }
  ): Promise<UserDocument | null>;
  findByEmailAndUsername(
    email: string,
    username: string
  ): Promise<UserDocument | null>;

  EmailConfirmation(): typeof EmailConfirmationStates;
}

// HTTP:
/**
 * Response body used for User related routes
 * Contains either the Public (sanitised) User or an Error
 */
export type PublicUserOrError = PublicUser | Error;

// authManagement:
/**
 * Note: This type should probably be updated to be removed in the future and use just PublicUserOrError
 *   - Contains either a GenericResponseBody for when there is no user found or attached to a request
 *   - Or a PublicUserOrError resulting from calling the `saveUser` helper.
 */
export type PublicUserOrErrorOrGeneric =
  | PublicUserOrError
  | GenericResponseBody;

/**
 * Response body used for unlinkGithub and unlinkGoogle
 *   - If user is not logged in, a GenericResponseBody with 404 is returned
 *   - If user is logged in, PublicUserOrError is returned
 */
export type UnlinkThirdPartyResponseBody = PublicUserOrErrorOrGeneric;

export interface ResetPasswordInitiateRequestBody {
  email: string;
}

/**
 * Request params used for validateResetPasswordToken & updatePassword
 */
export interface ResetOrUpdatePasswordRequestParams
  extends core.ParamsDictionary {
  token: string;
}
export interface UpdatePasswordRequestBody {
  password: string;
}

// signup:
export interface CreateUserRequestBody {
  username: string;
  email: string;
  password: string;
}
export interface DuplicateUserCheckQuery {
  // eslint-disable-next-line camelcase
  check_type: 'email' | 'username';
  email?: string;
  username?: string;
}
export interface VerifyEmailQuery {
  t: string;
}
