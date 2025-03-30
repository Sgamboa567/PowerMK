'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

export default function LoginPage() {
  const [userType, setUserType] = useState<'client' | 'consultant'>('client');
  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (userType === 'client') {
      router.push(`/catalogo?document=${document}`);
      return;
    }

    try {
      const result = await signIn('credentials', {
        document,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas');
        return;
      }

      // Obtener el rol del usuario
      const response = await fetch('/api/user/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document }),
      });

      const { role } = await response.json();

      // Redireccionar según el rol
      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'consultant') {
        router.push('/consultant');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Error al iniciar sesión');
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
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