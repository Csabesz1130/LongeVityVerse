import mongoose, { Schema, Document } from 'mongoose';

// Replaces Celery task tracking
export interface ISyncJob extends Document {
  userId: mongoose.Types.ObjectId;
  jobType: 'health_sync' | 'embedding_generation' | 'insights_generation' | 'weekly_report';
  source?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  progress: number;
  result?: any;
  error?: string;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

const SyncJobSchema = new Schema<ISyncJob>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  jobType: {
    type: String,
    enum: ['health_sync', 'embedding_generation', 'insights_generation', 'weekly_report'],
    required: true,
    index: true
  },
  source: String,
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'retrying'],
    default: 'pending',
    index: true
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  result: Schema.Types.Mixed,
  error: String,
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  scheduledAt: { type: Date, default: Date.now, index: true },
  startedAt: Date,
  completedAt: Date
}, {
  timestamps: true,
  collection: 'sync_jobs'
});

// Query indexes
SyncJobSchema.index({ userId: 1, status: 1, scheduledAt: -1 });
SyncJobSchema.index({ jobType: 1, status: 1 });
SyncJobSchema.index({ status: 1, scheduledAt: 1 }); // For job processing

// TTL for old completed jobs
SyncJobSchema.index({ completedAt: 1 }, { 
  expireAfterSeconds: 2592000, // 30 days
  partialFilterExpression: { status: 'completed' }
});

export default mongoose.models.SyncJob || mongoose.model<ISyncJob>('SyncJob', SyncJobSchema);
