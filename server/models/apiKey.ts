import mongoose, { Schema, Model, InferSchemaType } from 'mongoose';

interface IApiKey {
  label: string;
  lastUsedAt: Date;
  hashedKey: string;
}

interface ApiKeyVirtuals {
  id: string;
}

type ApiKeyModelType = Model<IApiKey, {}, {}, ApiKeyVirtuals>;

interface MongooseTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

interface SanitisedApiKey
  extends Omit<IApiKey, 'hashedKey'>,
    ApiKeyVirtuals,
    Pick<MongooseTimestamps, 'createdAt'> {}

export const apiKeySchema = new Schema<
  IApiKey,
  ApiKeyModelType,
  {},
  {},
  ApiKeyVirtuals
>(
  {
    label: { type: String, default: 'API Key' },
    lastUsedAt: { type: Date },
    hashedKey: { type: String, required: true }
  },
  { timestamps: true, _id: true }
);

apiKeySchema.virtual('id').get(function getApiKeyId() {
  return this._id.toHexString();
});

/**
 * When serialising an APIKey instance, the `hashedKey` field
 * should never be exposed to the client. So we only return
 * a safe list of fields when toObject and toJSON are called.
 */
function apiKeyMetadata(doc, ret, options): SanitisedApiKey {
  return {
    id: doc.id,
    label: doc.label,
    lastUsedAt: doc.lastUsedAt,
    createdAt: doc.createdAt
  };
}

apiKeySchema.set('toObject', {
  transform: apiKeyMetadata
});

apiKeySchema.set('toJSON', {
  virtuals: true,
  transform: apiKeyMetadata
});

// Derived type for schema fields (including timestamps)
type ApiKeySchemaType = InferSchemaType<typeof apiKeySchema>;

// The actual document type
// export type ApiKeyDocument = Document & ApiKeySchemaFields & ApiKeyVirtuals;