import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { connectDB } from './db'
import { User } from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        await connectDB()
        const user = await User.findOne({ email: credentials.email })

        if (!user) {
          throw new Error('User not found')
        }

        const isValid = await user.comparePassword(credentials.password)
        if (!isValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          plan: user.plan,
          onboardingCompleted: user.onboardingCompleted,
          timezone: user.timezone || 'America/New_York',
          sellerType: user.sellerType || null,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id
        token.plan = user.plan
        token.onboardingCompleted = (user as any).onboardingCompleted
        token.timezone = (user as any).timezone || 'America/New_York'
        token.sellerType = (user as any).sellerType || null
      }
      if (trigger === 'update' && session) {
        if (session.timezone) token.timezone = session.timezone
        if (session.sellerType !== undefined) token.sellerType = session.sellerType
        if (session.name) token.name = session.name
        if (session.onboardingCompleted !== undefined) token.onboardingCompleted = session.onboardingCompleted
        if (session.plan) token.plan = session.plan
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.plan = token.plan as string
        session.user.onboardingCompleted = token.onboardingCompleted as boolean
        session.user.timezone = (token.timezone as string) || 'America/New_York'
        session.user.sellerType = (token.sellerType as string) || undefined
      }
      // Update lastSeen here (Node.js runtime, not Edge)
      if (token.id) {
        try {
          await connectDB()
          await User.updateOne({ _id: token.id }, { lastSeen: new Date() })
        } catch {}
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
