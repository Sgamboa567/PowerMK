'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Este componente verifica periódicamente la suscripción mientras el usuario usa la app
export const SubscriptionChecker = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) return;
    
    const checkSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('subscription_status, subscription_end_date, role')
          .eq('id', session.user.id)
          .single();
          
        if (error) throw error;
        
        const isAdmin = data.role === 'admin';
        
        // Si no es admin y la suscripción expiró, redirigir a la página de pago
        if (!isAdmin && 
            (data.subscription_status !== 'active' || 
             new Date(data.subscription_end_date) <= new Date())) {
          router.push('/payment');
        }
      } catch (err) {
        console.error('Error verificando suscripción:', err);
      }
    };
    
    // Verificar cada 5 minutos
    const intervalId = setInterval(checkSubscription, 5 * 60 * 1000);
    
    // Verificar inmediatamente al cargar
    checkSubscription();
    
    return () => clearInterval(intervalId);
  }, [session, router]);
  
  return null; // Este componente no renderiza nada
};