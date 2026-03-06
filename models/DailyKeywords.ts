import mongoose from 'mongoose'

interface IKeywordEntry {
  keyword: string
  competitionScore: number
  resultCount: number
  isRocket: boolean
}

interface IDailyKeywords extends mongoose.Document {
  date: string
  sellerType: string
  v: number
  keywords: IKeywordEntry[]
  cachedAt: Date
}

const DailyKeywordsSchema = new mongoose.Schema<IDailyKeywords>({
  date: { type: String, required: true },
  sellerType: { type: String, required: true },
  v: { type: Number, default: 1 },
  keywords: [
    {
      keyword: String,
      competitionScore: Number,
      resultCount: Number,
      isRocket: Boolean,
    },
  ],
  cachedAt: { type: Date, default: Date.now },
})

DailyKeywordsSchema.index({ date: 1, sellerType: 1, v: 1 }, { unique: true })

export const DailyKeywords =
  mongoose.models.DailyKeywords ||
  mongoose.model<IDailyKeywords>('DailyKeywords', DailyKeywordsSchema)
