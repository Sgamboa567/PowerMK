'use client'
import { useState, useEffect } from 'react';
import { Box, Button, Container, Paper, Typography, IconButton, Stack } from '@mui/material';
import Link from 'next/link';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme as useMUITheme } from '@mui/material/styles';
import { useTheme } from '@/components/ThemeProvider';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export default function Home() {
  const theme = useMUITheme();
  const { toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular tiempo de carga inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 segundos de animación

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen message="Bienvenida a PowerMK" />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(245,218,223,0.05) 0%, rgba(26,26,26,1) 100%)'
          : 'linear-gradient(135deg, rgba(245,218,223,0.2) 0%, rgba(255,255,255,1) 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 8,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 2,
          alignItems: 'center'
        }}
      >
        <Link href="/login" passHref>
          <Button 
            variant="contained" 
            sx={{
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(245,218,223,0.2)' 
                : '#F5DADF',
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(245,218,223,0.3)' 
                  : 'rgba(245,218,223,0.8)',
              },
            }}
          >
            Iniciar Sesión
          </Button>
        </Link>
        <IconButton
          onClick={toggleTheme}
          sx={{ color: theme.palette.text.primary }}
        >
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>

      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? 'rgba(26,26,26,0.9)' 
              : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            border: theme.palette.mode === 'dark' 
              ? '1px solid rgba(245,218,223,0.1)' 
              : '1px solid rgba(245,218,223,0.3)',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontSize: { xs: '2rem', md: '3rem' },
              mb: 2
            }}
          >
            PowerMK
          </Typography>

          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
              fontSize: { xs: '1.2rem', md: '1.5rem' }
            }}
          >
            Sistema de Gestión Mary Kay
          </Typography>

          <Stack spacing={3} sx={{ maxWidth: 800, mx: 'auto', textAlign: 'left', mb: 4 }}>
            <Typography variant="body1">
              Bienvenida a PowerMK, tu herramienta integral para la gestión de tu negocio Mary Kay. 
              Diseñada específicamente para consultoras y sus clientes, nuestra plataforma ofrece:
            </Typography>

            <Box component="ul" sx={{ 
              pl: 2,
              '& > li': { 
                mb: 1,
                color: theme.palette.text.secondary 
              } 
            }}>
              <li>Catálogo digital actualizado y fácil de navegar</li>
              <li>Gestión eficiente de inventario y ventas</li>
              <li>Seguimiento personalizado de clientes</li>
              <li>Sistema de pedidos en línea</li>
              <li>Acceso directo para clientes sin necesidad de registro</li>
            </Box>

            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
              Explora nuestro catálogo y realiza pedidos sin necesidad de registro, 
              o inicia sesión como consultora para acceder a todas las funcionalidades.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}