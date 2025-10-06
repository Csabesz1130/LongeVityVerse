import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthData extends Document {
  userId: mongoose.Types.ObjectId;
  organization?: mongoose.Types.ObjectId; // Scoped to org
  source: 'google_fit' | 'fitbit' | 'apple_healthkit' | 'manual';
  dataType: 'steps' | 'heart_rate' | 'sleep' | 'activity' | 'weight' | 'blood_pressure';
  value: number;
  unit: string;
  metadata: Record<string, any>;
  timestamp: Date;
  syncedAt: Date;
  createdAt: Date;
}

const HealthDataSchema = new Schema<IHealthData>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
  source: { 
    type: String, 
    enum: ['google_fit', 'fitbit', 'apple_healthkit', 'manual'],
    required: true,
    index: true
  },
  dataType: {
    type: String,
    enum: ['steps', 'heart_rate', 'sleep', 'activity', 'weight', 'blood_pressure'],
    required: true,
    index: true
  },
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, required: true, index: true },
  syncedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'health_data'
});

// Compound indexes for efficient queries (Intercept pattern)
HealthDataSchema.index({ userId: 1, dataType: 1, timestamp: -1 });
HealthDataSchema.index({ organization: 1, dataType: 1, timestamp: -1 });
HealthDataSchema.index({ userId: 1, source: 1, timestamp: -1 });

// TTL index for data retention (optional)
HealthDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

export default mongoose.models.HealthData || mongoose.model<IHealthData>('HealthData', HealthDataSchema);
