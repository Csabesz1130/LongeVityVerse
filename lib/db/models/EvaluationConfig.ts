import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluationConfig extends Document {
  name: string;
  organization?: mongoose.Types.ObjectId;
  criteria: {
    name: string;
    weight: number; // 0-100
    description: string;
  }[];
  minimumScore: number;
  autoPublishThreshold?: number;
  active: boolean;
}

const EvaluationConfigSchema = new Schema<IEvaluationConfig>({
  name: { type: String, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
  criteria: [{
    name: { type: String, required: true },
    weight: { type: Number, min: 0, max: 100, required: true },
    description: String,
  }],
  minimumScore: { type: Number, min: 0, max: 100, default: 60 },
  autoPublishThreshold: { type: Number, min: 0, max: 100 },
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
  collection: 'evaluation_configs',
});

export default mongoose.models.EvaluationConfig || 
  mongoose.model<IEvaluationConfig>('EvaluationConfig', EvaluationConfigSchema);
