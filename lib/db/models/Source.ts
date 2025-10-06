import mongoose, { Schema, Document } from 'mongoose';

export interface ISource extends Document {
  domain: string;
  name: string;
  type: 'journal' | 'news' | 'blog' | 'institutional' | 'social';
  credibilityScore: number; // 0-100
  peerReviewed: boolean;
  impactFactor?: number;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  citations: number;
  lastChecked: Date;
  metadata: {
    issn?: string;
    country?: string;
    language?: string;
  };
}

const SourceSchema = new Schema<ISource>({
  domain: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['journal', 'news', 'blog', 'institutional', 'social'],
    required: true,
  },
  credibilityScore: { type: Number, min: 0, max: 100, default: 50 },
  peerReviewed: { type: Boolean, default: false },
  impactFactor: Number,
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  citations: { type: Number, default: 0 },
  lastChecked: { type: Date, default: Date.now },
  metadata: {
    issn: String,
    country: String,
    language: String,
  },
}, {
  timestamps: true,
  collection: 'sources',
});

export default mongoose.models.Source || mongoose.model<ISource>('Source', SourceSchema);
