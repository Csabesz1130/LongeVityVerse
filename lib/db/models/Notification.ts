import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'health_sync' | 'review_assigned' | 'review_complete' | 'insight_ready' | 'marketplace_message' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['health_sync', 'review_assigned', 'review_complete', 'insight_ready', 'marketplace_message', 'system'],
    required: true,
    index: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: Schema.Types.Mixed,
  read: { type: Boolean, default: false, index: true },
  actionUrl: String,
  actionLabel: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  expiresAt: { type: Date, index: true },
}, {
  timestamps: true,
  collection: 'notifications'
});

// Compound indexes
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// TTL index for expired notifications
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);