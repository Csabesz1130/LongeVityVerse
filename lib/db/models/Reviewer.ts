import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewer extends Document {
  userId: mongoose.Types.ObjectId;
  expertise: string[]; // Areas of expertise
  credentials: {
    degree: string;
    institution: string;
    yearCompleted: number;
  }[];
  publications: {
    title: string;
    journal: string;
    year: number;
    doi?: string;
  }[];
  reviewStats: {
    totalReviews: number;
    approvedCount: number;
    rejectedCount: number;
    averageScore: number;
    averageTurnaroundDays: number;
  };
  availability: boolean;
  maxReviewsPerMonth: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  createdAt: Date;
}

const ReviewerSchema = new Schema<IReviewer>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  expertise: [{ type: String, index: true }],
  credentials: [{
    degree: String,
    institution: String,
    yearCompleted: Number,
  }],
  publications: [{
    title: String,
    journal: String,
    year: Number,
    doi: String,
  }],
  reviewStats: {
    totalReviews: { type: Number, default: 0 },
    approvedCount: { type: Number, default: 0 },
    rejectedCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTurnaroundDays: { type: Number, default: 0 },
  },
  availability: { type: Boolean, default: true },
  maxReviewsPerMonth: { type: Number, default: 5 },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    index: true
  },
  verifiedAt: Date,
}, {
  timestamps: true,
  collection: 'reviewers'
});

export default mongoose.models.Reviewer || mongoose.model<IReviewer>('Reviewer', ReviewerSchema);