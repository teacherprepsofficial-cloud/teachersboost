import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

interface IUser extends mongoose.Document {
  email: string
  password?: string
  name: string
  plan: 'free' | 'pro' | 'admin' | 'starter'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  dailySearchCount: number
  dailySearchDate: Date
  emailVerified: boolean
  verificationToken?: string
  verificationTokenExpiry?: Date
  // Onboarding profile
  onboardingCompleted: boolean
  onboardingGoal?: string
  onboardingGrades?: string[]
  onboardingStoreStage?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    name: { type: String, required: true },
    plan: { type: String, enum: ['free', 'starter', 'pro', 'admin'], default: 'free' },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    dailySearchCount: { type: Number, default: 0 },
    dailySearchDate: { type: Date, default: Date.now },
    emailVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpiry: Date,
    onboardingCompleted: { type: Boolean, default: false },
    onboardingGoal: String,
    onboardingGrades: [String],
    onboardingStoreStage: String,
  },
  { timestamps: true }
)

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return
  }

  const hash = await bcrypt.hash(this.password!, 10)
  this.password = hash
})

// Method to compare passwords
UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password)
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
