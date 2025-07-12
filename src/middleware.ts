import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'
import { supabase } from '@/lib/supabase';

// Lista de rutas públicas
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/about',
  '/contact',
  '/plans',
  '/payment',
  '/auth',
];

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  const path = request.nextUrl.pathname;
  
  // Verificar si es una ruta pública o archivos estáticos
  const isPublicPath = PUBLIC_ROUTES.some(route => path === route || path.startsWith(`${route}/`)) ||
                       path.startsWith('/api/auth') ||
                       path.startsWith('/_next') ||
                       path.includes('.');

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Redirigir a login si no hay token
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar acceso a rutas protegidas con manejo mejorado de errores
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_status, role, subscription_end_date')
      .eq('id', token.sub)
      .single();

    // Si hay un error de Supabase, permitir acceso pero registrar el error
    if (error) {
      console.error('Error en middleware:', error);
      // Permitir acceso en caso de error con la base de datos para evitar bloqueos
      return NextResponse.next();
    }
    
    const isAdmin = data?.role?.toLowerCase() === 'admin';
    const hasActiveSubscription = 
      data?.subscription_status === 'active' && 
      (data?.subscription_end_date ? new Date(data.subscription_end_date) > new Date() : true);
    
    // Verificar rutas de consultor
    if (path.startsWith('/consultant') && !isAdmin && !hasActiveSubscription) {
      return NextResponse.redirect(new URL('/payment', request.url));
    }

    // Verificar rutas de administrador
    if (path.startsWith('/admin') && data.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    // En caso de error, permitir acceso para evitar bloqueos
    console.error('Error crítico en middleware:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|images|api/auth).*)',
  ],
}