import mongoose, { Schema, Document } from 'mongoose';

export interface IUserEvent extends Document {
  userId: mongoose.Types.ObjectId;
  organization?: mongoose.Types.ObjectId; // Scoped to org
  eventType: 'signup' | 'integration_connected' | 'data_sync' | 'score_viewed' | 'article_read' | 'subscription_started' | 'subscription_canceled';
  timestamp: Date;
  metadata: Record<string, any>;
  createdAt: Date;
}

const UserEventSchema = new Schema<IUserEvent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
  eventType: {
    type: String,
    enum: ['signup', 'integration_connected', 'data_sync', 'score_viewed', 'article_read', 'subscription_started', 'subscription_canceled'],
    required: true,
    index: true
  },
  timestamp: { type: Date, required: true, index: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
  collection: 'user_events'
});

// Compound indexes for efficient analytics queries
UserEventSchema.index({ userId: 1, timestamp: -1 });
UserEventSchema.index({ eventType: 1, timestamp: -1 });
UserEventSchema.index({ organization: 1, eventType: 1, timestamp: -1 });
UserEventSchema.index({ userId: 1, eventType: 1, timestamp: -1 });

// TTL index for data retention (optional - 2 years)
UserEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 });

export default mongoose.models.UserEvent || mongoose.model<IUserEvent>('UserEvent', UserEventSchema);
