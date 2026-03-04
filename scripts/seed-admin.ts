import mongoose from 'mongoose'

const MONGODB_URI = 'mongodb+srv://teachersboost_db_user:nJZ97WISEwLZT8Jk@cluster0.ket5vns.mongodb.net/teachersboost?retryWrites=true&w=majority'

const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  plan: String,
  dailySearchCount: Number,
  dailySearchDate: Date,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function main() {
  await mongoose.connect(MONGODB_URI)

  const admins = ['teachersboost@gmail.com', 'elliottzelinskas@gmail.com']

  for (const email of admins) {
    const user = await User.findOne({ email })
    if (user) {
      user.plan = 'admin'
      user.dailySearchCount = 0
      await user.save()
      console.log(`✅ ${email} → admin`)
    } else {
      console.log(`⚠️  ${email} not found — sign up first, then re-run`)
    }
  }

  await mongoose.disconnect()
}

main().catch(console.error)
