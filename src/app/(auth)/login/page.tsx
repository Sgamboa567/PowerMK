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
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export default function LoginPage() {
  const [userType, setUserType] = useState<'client' | 'consultant'>('client');
  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        document,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Credenciales inválidas');
        return;
      }

      if (result?.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      if (session.user.role === 'admin') {
        router.push('/admin');
      } else if (session.user.role === 'consultant') {
        router.push('/consultant');
      } else {
        router.push('/dashboard');
      }
    }
  }, [status, session?.user?.role]);

  if (status === 'loading' || isLoading) {
    return <LoadingScreen message="Verificando credenciales..." />;
  }

  if (status === 'authenticated' && session?.user?.role) {
    return <LoadingScreen message="Redirigiendo..." />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
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
            mb: 4,
            transition: 'color 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#F5DADF',
            }
          }}
        >
          PowerMK
        </Typography>
      </Link>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%'
        }}
      >
        <form onSubmit={handleSubmit}>
          <Typography variant="h5" align="center" gutterBottom>
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
            sx={{ mt: 3, mb: 2 }}
          >
            {userType === 'client' ? 'Ver Catálogo' : 'Iniciar Sesión'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}