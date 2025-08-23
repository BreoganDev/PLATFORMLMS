
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes
    if (pathname?.startsWith('/admin')) {
      if (!token || token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Student dashboard and course learning
    if (pathname?.startsWith('/dashboard') || pathname?.includes('/learn')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes
        if (pathname === '/' || pathname === '/courses' || pathname?.startsWith('/course/') && !pathname?.includes('/learn')) {
          return true
        }

        // Auth routes - redirect if already logged in
        if ((pathname === '/login' || pathname === '/register') && token) {
          return false
        }

        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/course/:path*/learn',
    '/login',
    '/register',
  ],
}
