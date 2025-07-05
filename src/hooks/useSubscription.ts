import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export const useSubscription = (requiredRole?: 'admin' | 'consultant') => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<{
    status: string | null;
    plan: string | null;
    endDate: Date | null;
  }>({
    status: null,
    plan: null,
    endDate: null
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        router.push('/login');
        return;
      }
      
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('subscription_status, subscription_plan, subscription_end_date, role')
            .eq('id', session.user.id)
            .single();
            
          if (error) throw error;
          
          const isAdmin = data.role === 'admin';
          const hasActiveSubscription = data.subscription_status === 'active' && 
                                     new Date(data.subscription_end_date) > new Date();
          
          // Si requiere ser admin y no lo es
          if (requiredRole === 'admin' && !isAdmin) {
            router.push('/');
            return;
          }
          
          // Si requiere ser consultant con suscripción activa
          if (requiredRole === 'consultant' && !isAdmin && !hasActiveSubscription) {
            router.push('/payment');
            return;
          }
          
          setSubscriptionData({
            status: data.subscription_status,
            plan: data.subscription_plan,
            endDate: data.subscription_end_date ? new Date(data.subscription_end_date) : null
          });
          
          setHasAccess(true);
        } catch (err) {
          console.error('Error verificando suscripción:', err);
          router.push('/');
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkAccess();
  }, [session, status, router, requiredRole]);
  
  return { loading, hasAccess, subscriptionData };
};