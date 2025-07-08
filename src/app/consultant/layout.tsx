'use client'
import { Box } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ConsultantSidebar from '@/components/consultant/layout/ConsultantSidebar';

export default function ConsultantLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protección de ruta
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'consultant') {
      router.push('/login');
    }
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return null; // O un componente de carga
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <ConsultantSidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: 0, // Cambiado de p: 3 a p: 0
          ml: { xs: 0, md: '240px' },
          transition: 'margin 0.3s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}