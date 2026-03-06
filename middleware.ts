import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        const protectedPrefixes = [
          '/admin', '/onboarding', '/saved-keywords', '/settings',
        ]
        if (protectedPrefixes.some(p => path.startsWith(p))) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*', '/onboarding',
    '/saved-keywords/:path*', '/settings/:path*',
  ],
}
