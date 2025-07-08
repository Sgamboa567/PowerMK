'use client'
import { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  useTheme,
  CircularProgress,
  Avatar
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CakeIcon from '@mui/icons-material/Cake';
import { format, isSameMonth, isSameYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

const BRAND_COLOR = '#FF90B3';

interface Client {
  id: string;
  name: string;
  phone: string;
  birthday?: string;
  sales?: {
    created_at: string;
  }[];
}

export function TrackingSummary() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [birthdays, setBirthdays] = useState<Client[]>([]);
  const [followUps, setFollowUps] = useState<Client[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        
        // Obtener todos los clientes
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select(`
            id,
            name,
            phone,
            birthday,
            sales (
              created_at
            )
          `)
          .eq('consultant_id', session.user.id);

        if (clientsError) throw clientsError;

        // Filtrar cumpleaños del mes actual
        const currentDate = new Date();
        const monthBirthdays = clients
          .filter(client => client.birthday && 
            isSameMonth(new Date(client.birthday), currentDate) &&
            isSameYear(new Date(client.birthday), currentDate))
          .sort((a, b) => new Date(a.birthday!).getDate() - new Date(b.birthday!).getDate())
          .slice(0, 5);

        // Filtrar clientes para seguimiento (sin compras en últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const needsFollowUp = clients
          .filter(client => {
            const lastSale = client.sales?.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];
            return !lastSale || new Date(lastSale.created_at) < thirtyDaysAgo;
          })
          .slice(0, 5);

        setBirthdays(monthBirthdays);
        setFollowUps(needsFollowUp);

      } catch (error) {
        console.error('Error fetching tracking data:', error);
        setError('No se pudo cargar la información de seguimiento');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const handleWhatsAppClick = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `¡Hola ${name}! Soy tu consultora Mary Kay, ¿cómo estás? 😊`
    );
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: '100%',
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(26,26,26,0.9)' 
              : 'rgba(255,255,255,0.9)',
            border: theme.palette.mode === 'dark' 
              ? '1px solid rgba(255,144,179,0.1)' 
              : '1px solid rgba(255,144,179,0.2)'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: theme.palette.text.primary 
            }}
          >
            📅 Seguimiento Pendiente
          </Typography>
          
          {followUps.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No hay seguimientos pendientes
            </Typography>
          ) : (
            followUps.map(client => (
              <Box
                key={client.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: BRAND_COLOR }}>
                    {client.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">{client.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sin compras recientes
                    </Typography>
                  </Box>
                </Box>
                <WhatsAppIcon 
                  sx={{ 
                    color: '#25D366',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={() => handleWhatsAppClick(client.phone, client.name)}
                />
              </Box>
            ))
          )}
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: '100%',
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(26,26,26,0.9)' 
              : 'rgba(255,255,255,0.9)',
            border: theme.palette.mode === 'dark' 
              ? '1px solid rgba(255,144,179,0.1)' 
              : '1px solid rgba(255,144,179,0.2)'
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: theme.palette.text.primary
            }}
          >
            🎂 Cumpleaños del Mes
          </Typography>

          {birthdays.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No hay cumpleaños este mes
            </Typography>
          ) : (
            birthdays.map(client => (
              <Box
                key={client.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(0,0,0,0.02)',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: BRAND_COLOR }}>
                    <CakeIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">{client.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {client.birthday && format(new Date(client.birthday), "d 'de' MMMM", { locale: es })}
                    </Typography>
                  </Box>
                </Box>
                <WhatsAppIcon 
                  sx={{ 
                    color: '#25D366',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={() => handleWhatsAppClick(client.phone, client.name)}
                />
              </Box>
            ))
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}