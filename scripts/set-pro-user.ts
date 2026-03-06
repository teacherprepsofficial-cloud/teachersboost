import mongoose from 'mongoose'

const MONGODB_URI = 'mongodb+srv://teachersboost_db_user:nJZ97WISEwLZT8Jk@cluster0.ket5vns.mongodb.net/teachersboost?retryWrites=true&w=majority'

const UserSchema = new mongoose.Schema({ email: String, plan: String }, { timestamps: true })
const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function main() {
  await mongoose.connect(MONGODB_URI)
  const email = 'taylabarr@gmail.com'
  const result = await User.findOneAndUpdate({ email }, { plan: 'pro' }, { new: true })
  if (result) {
    console.log(`✅ ${email} → pro`)
  } else {
    console.log(`⚠️  ${email} not found — have her sign up first, then re-run`)
  }
  await mongoose.disconnect()
}

main().catch(console.error)
