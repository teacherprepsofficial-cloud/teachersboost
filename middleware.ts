import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // This is just to verify auth; withAuth handles the actual logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if the route is protected
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        if (req.nextUrl.pathname.startsWith('/admin')) {
          // TODO: add admin role check
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
