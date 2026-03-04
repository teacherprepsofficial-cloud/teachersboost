import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        if (path.startsWith('/dashboard')) return !!token
        if (path.startsWith('/admin')) return !!token
        if (path.startsWith('/onboarding')) return !!token
        if (path.startsWith('/keywords')) return !!token
        if (path.startsWith('/shop-optimizer')) return !!token
        if (path.startsWith('/title-generator')) return !!token
        if (path.startsWith('/description-generator')) return !!token
        if (path.startsWith('/pricing-calculator')) return !!token
        if (path.startsWith('/settings')) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/onboarding',
    '/keywords/:path*',
    '/shop-optimizer/:path*',
    '/title-generator/:path*',
    '/description-generator/:path*',
    '/pricing-calculator/:path*',
    '/settings/:path*',
  ],
}
