import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rutas públicas
    const publicPaths = ['/', '/login', '/catalogo'];
    if (publicPaths.includes(path)) {
      if (token && path === '/login') {
        // Si está autenticado y trata de acceder al login, redirigir según rol
        return NextResponse.redirect(
          new URL(token.role === 'admin' ? '/admin' : '/consultant', req.url)
        );
      }
      return NextResponse.next();
    }

    // Si no hay token, redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Protección de rutas por rol
    if (path.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/consultant', req.url));
    }

    if (path.startsWith('/consultant') && token.role !== 'consultant') {
      return NextResponse.redirect(new URL('/admin', req.url));
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};