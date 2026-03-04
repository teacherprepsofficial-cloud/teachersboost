import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    plan?: string
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      plan?: string
    }
  }

  interface JWT {
    id?: string
    plan?: string
  }
}
