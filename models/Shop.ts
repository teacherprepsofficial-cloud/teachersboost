import mongoose from 'mongoose'

interface IShop extends mongoose.Document {
  tptUrl: string
  storeName: string
  rating: number
  ratingCount: number
  followers: number
  productCount: number
  topProducts: string[]
  lastScrapedAt: Date
  createdAt: Date
  updatedAt: Date
}

const ShopSchema = new mongoose.Schema<IShop>(
  {
    tptUrl: { type: String, required: true, unique: true, index: true },
    storeName: { type: String, required: true },
    rating: { type: Number, required: true },
    ratingCount: { type: Number, required: true },
    followers: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    topProducts: [String],
    lastScrapedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// TTL index: auto-delete 7 days after lastScrapedAt
ShopSchema.index({ lastScrapedAt: 1 }, { expireAfterSeconds: 604800 })

export const Shop =
  mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema)
