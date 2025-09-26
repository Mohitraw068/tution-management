import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { extractSubdomain, getInstituteBySubdomain } from "./lib/institute"

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl
    const hostname = req.headers.get('host') || ''

    // Extract subdomain from hostname
    const subdomain = extractSubdomain(hostname)

    // Clone the request headers
    const requestHeaders = new Headers(req.headers)

    // Add subdomain to headers for use in API routes and components
    if (subdomain) {
      requestHeaders.set('x-subdomain', subdomain)

      // For development or when we have a subdomain, try to get institute
      try {
        const institute = await getInstituteBySubdomain(subdomain)
        if (institute) {
          requestHeaders.set('x-institute-id', institute.id)
          requestHeaders.set('x-institute-name', institute.name)
          requestHeaders.set('x-institute-code', institute.instituteCode)
        } else {
          // Subdomain exists but no institute found - show error page
          if (!pathname.startsWith('/api/') && pathname !== '/institute-not-found') {
            return NextResponse.redirect(new URL('/institute-not-found?subdomain=' + subdomain, req.url))
          }
        }
      } catch (error) {
        console.error('Error fetching institute in middleware:', error)
      }
    }

    // Create response with modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // If accessing dashboard routes, ensure user is authenticated
    if (pathname.startsWith('/dashboard')) {
      const token = req.nextauth.token

      if (!token) {
        // Redirect to login if no token
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('callbackUrl', req.url)
        return NextResponse.redirect(loginUrl)
      }

      // Check if user has required role for specific dashboard routes
      const userRole = token.role as string
      const userInstituteId = token.instituteId as string

      // Verify user belongs to the current institute (if subdomain is detected)
      const requestInstituteId = requestHeaders.get('x-institute-id')
      if (requestInstituteId && userInstituteId !== requestInstituteId) {
        // User is trying to access a different institute - redirect to their own or logout
        return NextResponse.redirect(new URL('/login?error=InvalidInstitute', req.url))
      }

      // Admin routes - only OWNER and ADMIN can access
      if (pathname.startsWith('/dashboard/admin')) {
        if (!['OWNER', 'ADMIN'].includes(userRole)) {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }

      // Teacher routes - OWNER, ADMIN, TEACHER can access
      if (pathname.startsWith('/dashboard/teacher')) {
        if (!['OWNER', 'ADMIN', 'TEACHER'].includes(userRole)) {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }

      // Student routes - all authenticated users can access
      if (pathname.startsWith('/dashboard/student')) {
        // All authenticated users can access student routes
      }
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Allow access to auth pages without authentication
        if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/setup')) {
          return true
        }

        // Allow access to public routes and API routes
        if (pathname === '/' || pathname.startsWith('/api/')) {
          return true
        }

        // Protect dashboard routes - require authentication
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }

        // Allow access to other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}