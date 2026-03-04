import mongoose from 'mongoose'

interface IProduct extends mongoose.Document {
  tptUrl: string
  title: string
  price: number
  rating: number
  ratingCount: number
  views24h: number
  sellerName: string
  sellerUrl: string
  sellerFollowers: number
  grades: string[]
  subjects: string[]
  tags: string[]
  format: string
  pageCount: number
  keyword: string
  scrapedAt: Date
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    tptUrl: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true },
    ratingCount: { type: Number, required: true },
    views24h: { type: Number, default: 0 },
    sellerName: { type: String, required: true },
    sellerUrl: { type: String, required: true },
    sellerFollowers: { type: Number, default: 0 },
    grades: [String],
    subjects: [String],
    tags: [String],
    format: String,
    pageCount: { type: Number, default: 0 },
    keyword: { type: String, required: true, index: true },
    scrapedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// TTL index: auto-delete 7 days after scrapedAt
ProductSchema.index({ scrapedAt: 1 }, { expireAfterSeconds: 604800 })

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
