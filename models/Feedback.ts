import mongoose from 'mongoose'

interface IFeedback extends mongoose.Document {
  userId: string
  type: 'suggestion' | 'bug' | 'other'
  message: string
  page?: string
  createdAt: Date
}

const FeedbackSchema = new mongoose.Schema<IFeedback>(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: ['suggestion', 'bug', 'other'], required: true },
    message: { type: String, required: true },
    page: String,
  },
  { timestamps: true }
)

export const Feedback =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema)
