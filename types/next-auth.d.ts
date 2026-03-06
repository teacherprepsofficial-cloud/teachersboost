import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    plan?: string
    onboardingCompleted?: boolean
    timezone?: string
    sellerType?: string
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      plan?: string
      onboardingCompleted?: boolean
      timezone?: string
      sellerType?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    plan?: string
    onboardingCompleted?: boolean
    timezone?: string
    sellerType?: string
  }
}
