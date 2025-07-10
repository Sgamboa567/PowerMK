'use client'
import { Box } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ConsultantSidebar from '@/components/consultant/layout/ConsultantSidebar'; // Changed to default import
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '@/components/providers/ThemeProvider'; // Updated import path

export default function ConsultantLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const { toggleTheme, isDarkMode } = useThemeContext();

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
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <ConsultantSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          ml: { xs: 0, md: '0' }, // Quitar margen izquierdo
          transition: 'margin 0.3s ease',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', md: `calc(100% - 240px)` }, // Ajustar ancho para dejar espacio para el sidebar
        }}
      >
        {children}
      </Box>
    </Box>
  );
}