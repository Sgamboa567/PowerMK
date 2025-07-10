'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  TextField,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Paper,
  Container,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { motion } from 'framer-motion';
import { useThemeContext } from '@/components/providers/ThemeProvider';

const BRAND_COLOR = '#FF90B3'; // Define brand color to match other pages

export default function LoginPage() {
  const [userType, setUserType] = useState<'client' | 'consultant'>('client');
  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { data: session, status } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { toggleTheme, isDarkMode } = useThemeContext();

  // Manejar redirecciones basadas en la sesión
  useEffect(() => {
    console.log('Session status:', status);
    console.log('Session data:', session);

    if (status === 'authenticated' && session?.user?.role) {
      const path = session.user.role === 'admin' ? '/admin' : '/consultant';
      console.log('Redirecting to:', path);
      router.replace(path);
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!document.trim()) {
        setError('Por favor, ingrese su número de documento');
        setIsLoading(false);
        return;
      }

      if (userType === 'consultant' && !password) {
        setError('Por favor, ingrese su contraseña');
        setIsLoading(false);
        return;
      }

      console.log(`Intentando login: documento=${document}, userType=${userType}`);

      const result = await signIn('credentials', {
        document: document.trim(),
        password,
        redirect: false,
      });

      console.log('Resultado del login:', result);

      if (result?.error) {
        console.error('Error de autenticación:', result.error);
        setError('Documento o contraseña incorrectos');
        return;
      }

      if (result?.ok) {
        console.log('Login exitoso, redirigiendo...');
        const redirectTo = callbackUrl === '/' ? 
          (userType === 'client' ? '/' : '/consultant') : 
          callbackUrl;
        
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Error inesperado en login:', error);
      setError('Ha ocurrido un error durante el inicio de sesión');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <LoadingScreen message="Verificando credenciales..." />;
  }

  if (status === 'authenticated') {
    return <LoadingScreen message="Redirigiendo..." />;
  }

  return (
    <Box
      sx={{ 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(26,26,26,0.98) 0%, rgba(26,26,26,1) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(245,218,223,0.1) 100%)',
      }}
    >
      {/* Geometric background matching other pages */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: theme.palette.mode === 'dark' ? 0.5 : 0.8 }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${BRAND_COLOR}15, ${BRAND_COLOR}05)`
                : `linear-gradient(135deg, ${BRAND_COLOR}30, ${BRAND_COLOR}10)`,
              clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
              width: isMobile ? '150%' : '100%',
              height: isMobile ? '50%' : '100%',
              top: `${i * 33}%`,
              left: `${i * -15}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          />
        ))}
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 16 }, pb: 8, position: 'relative', zIndex: 5 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
          }}
        >
            <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              marginBottom: '32px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'color 0.3s ease',
            }}
            whileHover={{
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#F5DADF',
            }}
            >
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 700,
                color: theme.palette.mode === 'dark' ? '#F5DADF' : '#000000',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
              >
              PowerMK
              </Typography>
            </Link>
            </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                maxWidth: 400,
                width: '100%',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: theme.palette.mode === 'dark' ? '1px solid rgba(245,218,223,0.1)' : '1px solid rgba(245,218,223,0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            >
              <form onSubmit={handleSubmit}>
                <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
                  Iniciar Sesión
                </Typography>

                <ToggleButtonGroup
                  color="primary"
                  value={userType}
                  exclusive
                  onChange={(e, value) => value && setUserType(value)}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="client">Cliente</ToggleButton>
                  <ToggleButton value="consultant">Consultor/a</ToggleButton>
                </ToggleButtonGroup>

                <TextField
                  fullWidth
                  label="Documento"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  margin="normal"
                  required
                />

                {userType === 'consultant' && (
                  <TextField
                    fullWidth
                    type="password"
                    label="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                  />
                )}

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    bgcolor: '#F5DADF',
                    color: 'black',
                    fontWeight: 600,
                    padding: '12px',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 15px rgba(245,218,223,0.3)',
                    '&:hover': {
                      bgcolor: 'white',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(245,218,223,0.4)',
                    }
                  }}
                >
                  {userType === 'client' ? 'Ver Catálogo' : 'Iniciar Sesión'}
                </Button>
              </form>
            </Paper>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}