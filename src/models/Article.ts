import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticle extends Document {
  id: string;
  customId?: string;
  title: string;
  category: string;
  tag: string;
  summary: string;
  content?: string;
  linkUrl?: string;
  mediaUrl?: string;
  createdAt: Date;
  expiresAt: Date; // TTL Indexed: automatically purged by MongoDB after 30 days
  viewCount?: number;
}

const ArticleSchema = new Schema<IArticle>(
  {
    customId: { type: String, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    tag: { type: String, required: true },
    summary: { type: String, required: true },
    content: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    mediaUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, required: true },
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret: Record<string, unknown>) => {
        ret.id = ret.customId || (ret._id ? String(ret._id) : undefined);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// MongoDB Native TTL Index: Purges article automatically when expiresAt timestamp arrives
ArticleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ArticleModel: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);
