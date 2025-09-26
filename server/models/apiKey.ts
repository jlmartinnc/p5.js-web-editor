import { Schema, InferSchemaType } from 'mongoose';
import { SanitisedApiKey } from '../types/apiKey';

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

export interface ApiKeyVirtuals {
  id: string;
}

export type ApiKeySchemaType = InferSchemaType<typeof apiKeySchema>;

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
