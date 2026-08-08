import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/', '/login', '/register', '/about', '/contact', '/faq', '/terms', '/privacy', '/risk-disclosure', '/how-it-works', '/income-plan', '/rewards']
const authPaths = ['/login', '/register']
const adminPaths = ['/admin']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('nexarise-token')?.value
  
  // Allow public assets and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // Check if it's a public path
  const isPublicPath = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isAuthPath = authPaths.some(p => pathname === p)
  
  // If user is logged in and tries to access login/register, redirect to dashboard
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If no token and not a public path, redirect to login  
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Admin paths need additional check (full check happens server-side)
  if (pathname.startsWith('/admin') && token) {
    // Basic check - full RBAC happens in the page/API
    // We just ensure there's a token; role check is server-side
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
}
