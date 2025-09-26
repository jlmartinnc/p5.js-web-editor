import { Schema, Model, InferSchemaType, model, Document } from 'mongoose';

export const apiKeySchema = new Schema(
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

interface ApiKeyVirtuals {
  id: string;
}

type ApiKeySchemaType = InferSchemaType<typeof apiKeySchema>;

export type ApiKeyDocument = Document & ApiKeySchemaType & ApiKeyVirtuals;

export type ApiKeyModel = Model<ApiKeyDocument>;

export const ApiKey = model<ApiKeyDocument, ApiKeyModel>(
  'ApiKey',
  apiKeySchema
);

interface SanitisedApiKey
  extends Pick<ApiKeyDocument, 'id' | 'label' | 'lastUsedAt' | 'createdAt'> {}

/**
 * When serialising an APIKey instance, the `hashedKey` field
 * should never be exposed to the client. So we only return
 * a safe list of fields when toObject and toJSON are called.
 */
function apiKeyMetadata(doc: any, _ret: any, _options: any): SanitisedApiKey {
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
