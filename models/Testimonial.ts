import mongoose from 'mongoose'

interface ITestimonial extends mongoose.Document {
  userId: string
  userName: string
  rating: number
  message: string
  status: 'pending' | 'published' | 'deleted'
  createdAt: Date
}

const TestimonialSchema = new mongoose.Schema<ITestimonial>(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, maxlength: 600 },
    status: { type: String, enum: ['pending', 'published', 'deleted'], default: 'pending' },
  },
  { timestamps: true }
)

export const Testimonial = mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema)
