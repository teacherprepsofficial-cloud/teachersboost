import mongoose from 'mongoose'

interface ISuggestion {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
  avgPrice?: number
  avgViews24h?: number
  optimalPrice?: number
}

interface IKeywordSearch extends mongoose.Document {
  keyword: string
  resultCount: number
  competitionScore: number
  isRocket: boolean
  suggestions: ISuggestion[]
  trending: ISuggestion[]
  topProducts: string[]
  lastScrapedAt: Date
  createdAt: Date
  updatedAt: Date
}

const SuggestionSchema = new mongoose.Schema({
  keyword: String,
  resultCount: Number,
  competitionScore: Number,
  isRocket: Boolean,
  avgPrice: Number,
  avgViews24h: Number,
  optimalPrice: Number,
})

const KeywordSearchSchema = new mongoose.Schema<IKeywordSearch>(
  {
    keyword: { type: String, required: true, unique: true, index: true },
    resultCount: { type: Number, required: true },
    competitionScore: { type: Number, required: true },
    isRocket: { type: Boolean, required: true },
    suggestions: [SuggestionSchema],
    trending: [SuggestionSchema],
    topProducts: [String],
    lastScrapedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// TTL index: auto-delete documents 24 hours after lastScrapedAt
KeywordSearchSchema.index({ lastScrapedAt: 1 }, { expireAfterSeconds: 86400 })

export const KeywordSearch =
  mongoose.models.KeywordSearch ||
  mongoose.model<IKeywordSearch>('KeywordSearch', KeywordSearchSchema)
