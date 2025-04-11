import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log('Middleware - Path:', path); // Log para depuración
    console.log('Middleware - Token:', token); // Log para depuración

    // Rutas públicas
    if (path === '/' || path === '/login' || path === '/catalogo') {
      return NextResponse.next();
    }

    // Si no hay token, redirigir al login
    if (!token) {
      console.log('Middleware - No token, redirecting to /login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Protección de rutas por rol
    if (path.startsWith('/admin') && token.role !== 'admin') {
      console.log('Middleware - Unauthorized for admin, redirecting to /login');
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (path.startsWith('/consultant') && token.role !== 'consultant') {
      console.log('Middleware - Unauthorized for consultant, redirecting to /login');
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};