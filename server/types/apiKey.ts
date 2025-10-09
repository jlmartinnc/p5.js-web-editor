import { Model, Document, Types } from 'mongoose';
import { VirtualId, MongooseTimestamps } from './mongoose';
import { Error, RouteParam } from './express';

/** Full Api Key interface */
export interface IApiKey extends VirtualId, MongooseTimestamps {
  label: string;
  lastUsedAt?: Date;
  hashedKey: string;
}

/** Mongoose document object for API Key */
export interface ApiKeyDocument
  extends IApiKey,
    Omit<Document<Types.ObjectId>, 'id'> {
  toJSON(options?: any): SanitisedApiKey;
  toObject(options?: any): SanitisedApiKey;
}

/**
 * Sanitised API key object which hides the `hashedKey` field
 * and can be exposed to the client
 */
export interface SanitisedApiKey
  extends Pick<ApiKeyDocument, 'id' | 'label' | 'lastUsedAt' | 'createdAt'> {}

/** Mongoose model for API Key */
export interface ApiKeyModel extends Model<ApiKeyDocument> {}

// HTTP
/**
 * Response body for userController.createApiKey & userController.removeApiKey
 *   - Either an ApiKeyResponse or Error
 */
export type ApiKeyResponseOrError = ApiKeyResponse | Error;

export interface ApiKeyResponse {
  apiKeys: ApiKeyDocument[];
}

export interface CreateApiKeyRequestBody {
  label: string;
}
export interface RemoveApiKeyRequestParams extends RouteParam {
  keyId: string;
}
