import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewer extends Document {
  userId: mongoose.Types.ObjectId;
  expertise: string;
  credentials: Array<{ degree: string; institution: string; yearCompleted: number }>;
  publications: Array<{ title: string; journal: string; year: number; doi?: string }>;
  availability: boolean;
  maxReviewsPerMonth: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
}

const ReviewerSchema = new Schema<IReviewer>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  expertise: { type: String, required: true },
  credentials: [{ degree: String, institution: String, yearCompleted: Number }],
  publications: [{ title: String, journal: String, year: Number, doi: String }],
  availability: { type: Boolean, default: true },
  maxReviewsPerMonth: { type: Number, default: 10 },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending', index: true },
  verifiedAt: Date,
}, { timestamps: true, collection: 'reviewers' });

ReviewerSchema.index({ userId: 1 });

export default mongoose.models.Reviewer || mongoose.model<IReviewer>('Reviewer', ReviewerSchema);


