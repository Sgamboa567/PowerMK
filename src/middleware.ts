import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request })
  
  // Allow access to public paths and static files
  const isPublicPath = request.nextUrl.pathname === '/' || 
                      request.nextUrl.pathname.startsWith('/api/auth') || 
                      request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/about') ||
                      request.nextUrl.pathname.startsWith('/contact') ||
                      request.nextUrl.pathname.startsWith('/plans') ||
                      request.nextUrl.pathname.startsWith('/auth') ||
                      request.nextUrl.pathname.startsWith('/_next') ||
                      request.nextUrl.pathname.includes('.')

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Protect all other routes
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|images|.*\\..*|api/auth).*)',
  ]
}