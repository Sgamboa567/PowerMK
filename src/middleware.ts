import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequestWithAuth } from 'next-auth/middleware'
import { supabase } from '@/lib/supabase';

export default async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request })
  
  // Allow access to public paths and static files
  const isPublicPath = request.nextUrl.pathname === '/' || 
                      request.nextUrl.pathname.startsWith('/api/auth') || 
                      request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/about') ||
                      request.nextUrl.pathname.startsWith('/contact') ||
                      request.nextUrl.pathname.startsWith('/plans') ||
                      request.nextUrl.pathname.startsWith('/payment') ||
                      request.nextUrl.pathname.startsWith('/auth') ||
                      request.nextUrl.pathname.startsWith('/_next') ||
                      request.nextUrl.pathname.includes('.')

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Protect all other routes - first check authentication
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Check if user has access to protected routes
  // Checks for subscription status for consultant routes
  if (request.nextUrl.pathname.startsWith('/consultant')) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_status, role, subscription_end_date')
        .eq('id', token.sub)
        .single();

      if (error) throw error;
      
      const isAdmin = data?.role?.toLowerCase() === 'admin';
      const hasActiveSubscription = 
        data?.subscription_status === 'active' && 
        (data?.subscription_end_date ? new Date(data.subscription_end_date) > new Date() : true);
      
      console.log('Middleware check:', { 
        userId: token.sub, 
        role: data?.role, 
        subscriptionStatus: data?.subscription_status,
        hasActiveSubscription,
        isAdmin 
      });

      if (!isAdmin && !hasActiveSubscription) {
        // Redirect to payment page if subscription not active
        console.log('Redirecting to payment due to inactive subscription');
        return NextResponse.redirect(new URL('/payment', request.url));
      }
    } catch (err) {
      console.error('Error checking subscription status:', err);
      // If error, default to denying access
      return NextResponse.redirect(new URL('/payment', request.url));
    }
  }

  // Admin routes check
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', token.sub)
        .single();

      if (error) throw error;
      
      if (data.role !== 'admin') {
        // Redirect to home if not admin
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|images|api/auth).*)',
  ],
}