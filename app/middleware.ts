import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // ✅ NUEVO: si ya está logueado y entra a /login o /register, lo mando al dashboard
    if ((pathname === '/login' || pathname === '/register') && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

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
        if (
          pathname === '/' ||
          pathname === '/courses' ||
          (pathname?.startsWith('/course/') && !pathname?.includes('/learn')) ||
          // ✅ NUEVO: /login y /register SIEMPRE permitidos (evita bucle)
          pathname === '/login' ||
          pathname === '/register'
        ) {
          return true
        }

        // Resto: requiere sesión
        return !!token
      },
    },
    pages: { signIn: '/login' },
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
