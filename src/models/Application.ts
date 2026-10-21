import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  id: string;
  name: string;
  email: string;
  city: string;
  role: string;
  message: string;
  agreeToContact: boolean;
  emailSent: boolean;
  emailStatusMessage?: string;
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    city: { type: String, default: '' },
    role: { type: String, default: 'Joining the community' },
    message: { type: String, default: '' },
    agreeToContact: { type: Boolean, required: true },
    emailSent: { type: Boolean, default: false },
    emailStatusMessage: { type: String },
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

export const ApplicationModel: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
