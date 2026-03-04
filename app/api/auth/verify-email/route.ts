import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/verify-email?error=missing', req.url))
    }

    await connectDB()

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/verify-email?error=invalid', req.url))
    }

    user.emailVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpiry = undefined
    await user.save()

    return NextResponse.redirect(new URL('/verify-email?success=true', req.url))
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.redirect(new URL('/verify-email?error=server', req.url))
  }
}
