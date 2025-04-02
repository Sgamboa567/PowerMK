import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Lista de rutas públicas
    const publicRoutes = ['/login', '/catalogo'];
    if (publicRoutes.includes(path)) {
      // Si está autenticado y trata de acceder a login, redirigir según rol
      if (token) {
        if (token.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
        if (token.role === 'consultant') {
          return NextResponse.redirect(new URL('/consultant', req.url));
        }
      }
      return NextResponse.next();
    }

    // Si no hay token, redirigir al login
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
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
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/consultant/:path*',
    '/login',
    '/catalogo'
  ]
};