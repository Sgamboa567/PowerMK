import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rutas públicas que no requieren autenticación
    const publicPaths = ['/', '/login', '/catalogo'];
    
    if (publicPaths.includes(path)) {
      return NextResponse.next();
    }

    // Si no hay token, redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Protección de rutas por rol
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
      authorized: ({ req }) => {
        const path = req.nextUrl.pathname;
        return path === '/login' || path === '/' || path === '/catalogo';
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};