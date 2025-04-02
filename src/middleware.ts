import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Permitir acceso a rutas públicas
    if (path === '/login' || path === '/catalogo') {
      return NextResponse.next();
    }

    // Si no hay token, redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Proteger rutas según el rol
    if (path.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (path.startsWith('/consultant') && token.role !== 'consultant') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/consultant/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};