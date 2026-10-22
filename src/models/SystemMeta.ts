import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemMeta extends Document {
  key: string;
  isSeeded: boolean;
  migratedAt?: Date;
  version: number;
}

const SystemMetaSchema = new Schema<ISystemMeta>(
  {
    key: { type: String, required: true, unique: true },
    isSeeded: { type: Boolean, default: false },
    migratedAt: { type: Date },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const SystemMetaModel: Model<ISystemMeta> =
  mongoose.models.SystemMeta || mongoose.model<ISystemMeta>('SystemMeta', SystemMetaSchema);
