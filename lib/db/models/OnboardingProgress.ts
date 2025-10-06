import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboardingProgress extends Document {
  userId: mongoose.Types.ObjectId;
  steps: {
    profileSetup: boolean;
    healthGoals: boolean;
    integrations: boolean;
    firstContent: boolean;
    communityIntro: boolean;
  };
  completedAt?: Date;
  skippedSteps: string[];
  personalizedData: {
    ageRange?: string;
    primaryGoals?: string[];
    healthConcerns?: string[];
    experience?: string;
  };
}

const OnboardingProgressSchema = new Schema<IOnboardingProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  steps: {
    profileSetup: { type: Boolean, default: false },
    healthGoals: { type: Boolean, default: false },
    integrations: { type: Boolean, default: false },
    firstContent: { type: Boolean, default: false },
    communityIntro: { type: Boolean, default: false },
  },
  completedAt: Date,
  skippedSteps: [String],
  personalizedData: {
    ageRange: String,
    primaryGoals: [String],
    healthConcerns: [String],
    experience: String,
  },
}, {
  timestamps: true,
  collection: 'onboarding_progress',
});

export default mongoose.models.OnboardingProgress || 
  mongoose.model<IOnboardingProgress>('OnboardingProgress', OnboardingProgressSchema);
