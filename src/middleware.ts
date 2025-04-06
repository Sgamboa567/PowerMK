import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Lista de rutas públicas
    const publicPaths = ['/', '/login', '/catalogo'];
    
    if (publicPaths.includes(path)) {
      // Si está autenticado e intenta acceder al login, redirigir según rol
      if (path === '/login' && token) {
        const redirectPath = token.role === 'admin' ? '/admin' : '/consultant';
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
      return NextResponse.next();
    }

    // Si no hay token, redirigir al login
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', path);
      return NextResponse.redirect(loginUrl);
    }

    // Proteger rutas por rol
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
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Siempre permitir rutas públicas
        if (path === '/' || path === '/catalogo') {
          return true;
        }

        // Permitir acceso a login solo si no está autenticado
        if (path === '/login') {
          return !token;
        }

        // Para otras rutas, requerir token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};