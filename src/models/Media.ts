import mongoose, { Schema, Document, Model } from 'mongoose';
import { MediaType } from '@/lib/types';

export interface IMedia extends Document {
  id: string;
  title: string;
  filename?: string;
  url: string;
  type: MediaType;
  size?: number;
  mimeType?: string;
  imagekitFileId?: string;
  storageProvider?: 'imagekit' | 'local' | 'external';
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    title: { type: String, required: true },
    filename: { type: String },
    url: { type: String, required: true },
    type: { type: String, required: true, enum: ['image', 'video', 'document', 'link'] },
    size: { type: Number },
    mimeType: { type: String },
    imagekitFileId: { type: String },
    storageProvider: { type: String, enum: ['imagekit', 'local', 'external'], default: 'local' },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = ret._id ? String(ret._id) : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const MediaModel: Model<IMedia> =
  mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
