import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')

  if (!email) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  try {
    await connectDB()
    await User.updateOne({ email: email.toLowerCase() }, { emailOptIn: false })
  } catch {}

  return NextResponse.redirect(new URL(`/unsubscribe?done=1`, req.url))
}
