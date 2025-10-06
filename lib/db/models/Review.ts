import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  contentId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  score: number; // 0-100
  criteria: {
    scientificAccuracy: number; // 0-20
    relevanceToLongevity: number; // 0-20
    clarity: number; // 0-20
    citations: number; // 0-20
    novelty: number; // 0-20
  };
  comments: string;
  suggestions: string[];
  requiresRevision: boolean;
  decisionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  contentId: { type: Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'revision_requested'],
    default: 'pending',
    index: true
  },
  score: { type: Number, min: 0, max: 100 },
  criteria: {
    scientificAccuracy: { type: Number, min: 0, max: 20, required: true },
    relevanceToLongevity: { type: Number, min: 0, max: 20, required: true },
    clarity: { type: Number, min: 0, max: 20, required: true },
    citations: { type: Number, min: 0, max: 20, required: true },
    novelty: { type: Number, min: 0, max: 20, required: true },
  },
  comments: { type: String, required: true },
  suggestions: [String],
  requiresRevision: { type: Boolean, default: false },
  decisionDate: Date,
}, {
  timestamps: true,
  collection: 'reviews'
});

// Calculate total score from criteria
ReviewSchema.pre('save', function(next) {
  const criteria = this.criteria;
  this.score = 
    criteria.scientificAccuracy +
    criteria.relevanceToLongevity +
    criteria.clarity +
    criteria.citations +
    criteria.novelty;
  next();
});

// Indexes
ReviewSchema.index({ contentId: 1, reviewerId: 1 }, { unique: true });
ReviewSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
