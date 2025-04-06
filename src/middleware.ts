import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Lista de rutas públicas
    const publicPaths = ['/', '/login', '/catalogo'];
    
    // Permitir acceso a rutas públicas
    if (publicPaths.includes(path)) {
      return NextResponse.next();
    }

    // Si no hay token, redirigir al login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Proteger rutas por rol
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
      authorized: ({ req, token }) => {
        // Permitir rutas públicas sin token
        if (req.nextUrl.pathname === '/login' || 
            req.nextUrl.pathname === '/' || 
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