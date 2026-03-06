import mongoose from 'mongoose'

interface IBlogPost {
  title: string
  url: string
  publishedAt: Date
  excerpt: string
}

interface IBlogCache extends mongoose.Document {
  posts: IBlogPost[]
  cachedAt: Date
}

const BlogCacheSchema = new mongoose.Schema<IBlogCache>({
  posts: [
    {
      title: String,
      url: String,
      publishedAt: Date,
      excerpt: String,
    },
  ],
  cachedAt: { type: Date, default: Date.now },
})

export const BlogCache =
  mongoose.models.BlogCache ||
  mongoose.model<IBlogCache>('BlogCache', BlogCacheSchema)
