import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rutas públicas que no requieren autenticación
    if (path === '/' || path === '/login' || path === '/catalogo') {
      // Si el usuario está autenticado y trata de acceder al login, redirigir según su rol
      if (path === '/login' && token?.role) {
        switch (token.role) {
          case 'admin':
            return NextResponse.redirect(new URL('/admin', req.url));
          case 'consultant':
            return NextResponse.redirect(new URL('/consultant', req.url));
          default:
            return NextResponse.redirect(new URL('/', req.url));
        }
      }
      return NextResponse.next();
    }

    // Si no hay token y la ruta requiere autenticación
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Protección de rutas basada en roles
    if (path.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (path.startsWith('/consultant') && token.role !== 'consultant') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a rutas públicas sin token
        if (req.nextUrl.pathname === '/' || 
            req.nextUrl.pathname === '/login' || 
            req.nextUrl.pathname === '/catalogo') {
          return true;
        }
        // Para otras rutas, requerir token
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