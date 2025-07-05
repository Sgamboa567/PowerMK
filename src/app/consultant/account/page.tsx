'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  useTheme
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

const BRAND_COLOR = '#FF90B3';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  mary_kay_id?: string;
  document?: string;
  image?: string;
}

export default function ConsultantAccountPage() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    mary_kay_id: '',
    document: ''
  });
  
  useEffect(() => {
    // Ensure navbar is hidden in dashboards
    document.body.classList.add('hide-navbar');
    
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) throw error;
          
          setProfile({
            id: data.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            mary_kay_id: data.mary_kay_id || '',
            document: data.document || '',
            image: data.image || ''
          });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setError('No se pudo cargar el perfil de usuario');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUserProfile();
    
    // Clean up
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, [session]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          mary_kay_id: profile.mary_kay_id
        })
        .eq('id', session?.user?.id);
        
      if (error) throw error;
      
      setSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box 
      sx={{ 
        py: 4,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(26,26,26,0.98) 0%, rgba(26,26,26,1) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(245,218,223,0.1) 100%)',
        borderRadius: 2
      }}
    >
      <Typography variant="h4" gutterBottom fontWeight="500">
        Mi cuenta Mary Kay
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Administra tus datos personales y tu información de consultora
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              textAlign: 'center', 
              height: '100%',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(245,218,223,0.1)' : '1px solid rgba(245,218,223,0.3)'
            }}
          >
            <Avatar
              src={profile.image || undefined}
              alt={profile.name}
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 2,
                bgcolor: BRAND_COLOR,
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {profile.name?.charAt(0) || 'C'}
            </Avatar>
            
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              {profile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {profile.email}
            </Typography>
            
            <Box sx={{ bgcolor: BRAND_COLOR + '20', py: 1, px: 2, borderRadius: 2, display: 'inline-block' }}>
              <Typography variant="subtitle2" color={BRAND_COLOR} fontWeight="600">
                Consultora Mary Kay
              </Typography>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body2" sx={{ mb: 1, textAlign: 'left', fontWeight: '500' }}>
              ID Mary Kay:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'left' }}>
              {profile.mary_kay_id || 'No registrado'}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 1, textAlign: 'left', fontWeight: '500' }}>
              Documento:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, textAlign: 'left' }}>
              {profile.document || 'No registrado'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(245,218,223,0.1)' : '1px solid rgba(245,218,223,0.3)'
            }}
          >
            <Typography variant="h5" sx={{ mb: 3 }}>
              Información personal
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre completo"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Correo electrónico"
                    name="email"
                    value={profile.email}
                    disabled
                    helperText="El correo no se puede modificar"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ID de consultora Mary Kay"
                    name="mary_kay_id"
                    value={profile.mary_kay_id}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Documento"
                    name="document"
                    value={profile.document}
                    disabled
                    helperText="El documento no se puede modificar"
                  />
                </Grid>
                
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}
                
                <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    sx={{
                      bgcolor: BRAND_COLOR,
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#e57a9e',
                      },
                    }}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Guardar cambios'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
          
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              borderRadius: 2, 
              mt: 3,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(245,218,223,0.1)' : '1px solid rgba(245,218,223,0.3)'
            }}
          >
            <Typography variant="h5" sx={{ mb: 3 }}>
              Seguridad
            </Typography>
            
            <Button
              variant="outlined"
              sx={{
                borderColor: BRAND_COLOR,
                color: BRAND_COLOR,
                '&:hover': {
                  borderColor: '#e57a9e',
                  bgcolor: BRAND_COLOR + '10',
                },
              }}
            >
              Cambiar contraseña
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={success}
        autoHideDuration={5000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Perfil actualizado con éxito
        </Alert>
      </Snackbar>
    </Box>
  );
}