import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  image?: string
  plan: 'free' | 'pro'
  invoiceCount: number
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  logo?: string
  brandColor: string
  currency: string
  language: 'en' | 'bn'
  taxRate: number
  footerNote?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    image: String,
    plan: { type: String, enum: ['free', 'pro'], default: 'free' },
    invoiceCount: { type: Number, default: 0 },
    businessName: String,
    businessAddress: String,
    businessPhone: String,
    businessEmail: String,
    logo: String,
    brandColor: { type: String, default: '#6366f1' },
    currency: { type: String, default: 'USD' },
    language: { type: String, enum: ['en', 'bn'], default: 'en' },
    taxRate: { type: Number, default: 0 },
    footerNote: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String,
  },
  { timestamps: true }
)

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
