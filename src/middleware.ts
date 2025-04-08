import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Lista de rutas públicas
    const publicPaths = ['/', '/login', '/catalogo', '/api/auth/signin'];
    
    // Permitir rutas públicas sin verificación
    if (publicPaths.includes(path)) {
      return NextResponse.next();
    }

    // Si no hay token, redirigir al login
    if (!token) {
      const loginUrl = new URL('/login', req.url);
      // Guardar la URL original para redirigir después del login
      loginUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar permisos por rol
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
        const path = req.nextUrl.pathname;
        
        // Permitir rutas públicas siempre
        if (path === '/' || 
            path === '/login' || 
            path === '/catalogo' || 
            path.startsWith('/api/auth')) {
          return true;
        }
        
        // Para rutas protegidas, requerir token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth/* (NextAuth endpoints)
     * 2. /_next/* (Next.js internals)
     * 3. /static/* (static files)
     * 4. /*.{ico,png,jpg} (static files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)' 
  ],
};