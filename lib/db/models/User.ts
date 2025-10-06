import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  password?: string;
  role?: 'admin' | 'reviewer' | 'user';
  organization?: mongoose.Types.ObjectId; // Scoped model concept from Intercept
  healthIntegrations: {
    googleFit?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
      connected: boolean;
    };
    fitbit?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: Date;
      connected: boolean;
    };
    appleHealthKit?: {
      enabled: boolean;
      lastSync: Date;
    };
  };
  preferences: {
    syncFrequency: 'realtime' | 'hourly' | 'daily';
    enableAIInsights: boolean;
    notificationsEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['admin', 'reviewer', 'user'], default: 'user', index: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  healthIntegrations: {
    googleFit: {
      accessToken: { type: String, select: false }, // Secure field
      refreshToken: { type: String, select: false },
      expiresAt: Date,
      connected: { type: Boolean, default: false }
    },
    fitbit: {
      accessToken: { type: String, select: false },
      refreshToken: { type: String, select: false },
      expiresAt: Date,
      connected: { type: Boolean, default: false }
    },
    appleHealthKit: {
      enabled: { type: Boolean, default: false },
      lastSync: Date
    }
  },
  preferences: {
    syncFrequency: { 
      type: String, 
      enum: ['realtime', 'hourly', 'daily'],
      default: 'daily'
    },
    enableAIInsights: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes for performance (adapted from Intercept's scoped queries)
UserSchema.index({ organization: 1, email: 1 });
UserSchema.index({ 'healthIntegrations.googleFit.connected': 1 });
UserSchema.index({ 'healthIntegrations.fitbit.connected': 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
