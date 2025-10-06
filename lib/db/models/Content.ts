import mongoose, { Schema, Document } from 'mongoose';

export interface IContent extends Document {
  title: string;
  description: string;
  body: string;
  author: mongoose.Types.ObjectId;
  organization?: mongoose.Types.ObjectId; // Scoped content
  category: 'research' | 'blog' | 'guide' | 'news';
  tags: string[];
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  evaluation?: {
    score: number;
    reviewedBy: mongoose.Types.ObjectId;
    reviewedAt: Date;
    comments: string;
  };
  vectorId?: string; // Pinecone vector ID
  embedding?: number[]; // Cached embedding
  sentiment?: {
    score: number; // -1 to 1
    magnitude: number;
  };
  views: number;
  relatedContent: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const ContentSchema = new Schema<IContent>({
  title: { type: String, required: true, index: 'text' },
  description: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', index: true },
  category: {
    type: String,
    enum: ['research', 'blog', 'guide', 'news'],
    required: true,
    index: true
  },
  tags: [{ type: String, index: true }],
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  evaluation: {
    score: { type: Number, min: 0, max: 100 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    comments: String
  },
  vectorId: { type: String, index: true }, // For Pinecone
  embedding: [Number], // Cached for quick similarity
  sentiment: {
    score: { type: Number, min: -1, max: 1 },
    magnitude: { type: Number, min: 0 }
  },
  views: { type: Number, default: 0 },
  relatedContent: [{ type: Schema.Types.ObjectId, ref: 'Content' }],
  publishedAt: Date
}, {
  timestamps: true,
  collection: 'content'
});

// Indexes adapted from Intercept's query patterns
ContentSchema.index({ organization: 1, status: 1, publishedAt: -1 });
ContentSchema.index({ category: 1, status: 1, publishedAt: -1 });
ContentSchema.index({ tags: 1, status: 1 });
ContentSchema.index({ 'evaluation.score': -1 });

// Text search index
ContentSchema.index({ title: 'text', description: 'text', body: 'text' });

export default mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);
