import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rutas públicas no requieren autenticación
    if (path === '/' || path === '/login' || path === '/catalogo') {
      return NextResponse.next();
    }

    // Si no hay token, redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Proteger rutas por rol
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
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        
        // Permitir rutas públicas
        if (path === '/' || path === '/login' || path === '/catalogo') {
          return true;
        }
        
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};