'use client';

import { useState } from 'react';
import { 
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
      // Cliente solo necesita documento
      router.push(`/catalogo?document=${document}`);
      return;
    }

    // Consultor/a necesita autenticación completa
    const result = await signIn('credentials', {
      document,
      password,
      redirect: false
    });

    if (result?.error) {
      setError('Credenciales inválidas');
    } else {
      router.push('/dashboard');
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
      <Card sx={{ maxWidth: 400, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            PowerMK
          </Typography>
          
          <ToggleButtonGroup
            value={userType}
            exclusive
            onChange={(_, value) => value && setUserType(value)}
            fullWidth
            sx={{ mb: 3 }}
          >
            <ToggleButton value="client">Cliente</ToggleButton>
            <ToggleButton value="consultant">Consultor/a</ToggleButton>
          </ToggleButtonGroup>

          <form onSubmit={handleSubmit}>
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
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
            >
              {userType === 'client' ? 'Continuar' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}