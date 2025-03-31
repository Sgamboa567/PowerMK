'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (userType === 'client') {
      router.push(`/catalogo?document=${document}`);
      return;
    }

    try {
      const result = await signIn('credentials', {
        document,
        password,
        redirect: false,
        callbackUrl: '/consultant' // Añadir callbackUrl por defecto
      });

      if (result?.error) {
        setError('Credenciales inválidas');
        return;
      }

      if (result?.ok) {
        // Redirección directa basada en las credenciales
        const response = await fetch('/api/auth/role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ document }),
        });

        const { role } = await response.json();

        if (role === 'admin') {
          router.push('/admin');
        } else if (role === 'consultant') {
          router.push('/consultant');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Iniciando sesión..." />;
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
          width: '100%',
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
            <ToggleButton value="consultant">Consultora</ToggleButton>
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