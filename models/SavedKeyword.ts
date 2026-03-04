import mongoose from 'mongoose'

const SavedKeywordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    keyword: { type: String, required: true },
    competitionScore: { type: Number, default: 0 },
    resultCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

SavedKeywordSchema.index({ userId: 1, keyword: 1 }, { unique: true })

export const SavedKeyword =
  mongoose.models.SavedKeyword || mongoose.model('SavedKeyword', SavedKeywordSchema)
