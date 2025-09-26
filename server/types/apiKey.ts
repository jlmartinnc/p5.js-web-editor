import { Model, model, Document } from 'mongoose';
import {
  ApiKeySchemaType,
  apiKeySchema,
  ApiKeyVirtuals
} from '../models/apiKey';

export type ApiKeyDocument = Document & ApiKeySchemaType & ApiKeyVirtuals;

export type ApiKeyModel = Model<ApiKeyDocument>;

export const ApiKey = model<ApiKeyDocument, ApiKeyModel>(
  'ApiKey',
  apiKeySchema
);

export interface SanitisedApiKey
  extends Pick<ApiKeyDocument, 'id' | 'label' | 'lastUsedAt' | 'createdAt'> {}
