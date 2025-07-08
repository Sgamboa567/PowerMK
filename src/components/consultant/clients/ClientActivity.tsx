'use client'
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Chip,
  useTheme,
  CircularProgress,
  Tooltip,
  Badge
} from '@mui/material';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import MessageIcon from '@mui/icons-material/Message';
import EventIcon from '@mui/icons-material/Event';

const BRAND_COLOR = '#FF90B3';

interface Activity {
  id: string;
  type: 'purchase' | 'inquiry' | 'followup';
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  details: string;
  amount?: number;
}

export function ClientActivity() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBagIcon sx={{ color: BRAND_COLOR }} />;
      case 'inquiry':
        return <MessageIcon sx={{ color: 'info.main' }} />;
      case 'followup':
        return <EventIcon sx={{ color: 'warning.main' }} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchActivities = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);

        // Obtener ventas recientes
        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            created_at,
            amount,
            clients (
              id,
              name,
              phone
            )
          `)
          .eq('consultant_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (salesError) throw salesError;

        // Formatear actividades
        const formattedActivities: Activity[] = sales?.map(sale => ({
          id: sale.id,
          type: 'purchase',
          clientId: sale.clients.id,
          clientName: sale.clients.name,
          clientPhone: sale.clients.phone,
          date: sale.created_at,
          details: `Compra por $${sale.amount.toLocaleString()}`,
          amount: sale.amount
        })) || [];

        setActivities(formattedActivities);

      } catch (error) {
        console.error('Error fetching activities:', error);
        setError('No se pudo cargar la actividad de clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [session]);

  const handleWhatsApp = (phone: string, name: string) => {
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
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark'
          ? 'rgba(26,26,26,0.9)'
          : 'rgba(255,255,255,0.9)',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(255,144,179,0.1)'
          : '1px solid rgba(255,144,179,0.2)'
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        Actividad Reciente de Clientes
      </Typography>

      <List>
        {activities.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No hay actividad reciente
          </Typography>
        ) : (
          activities.map((activity) => (
            <ListItem
              key={activity.id}
              sx={{
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.02)',
                borderRadius: 1,
                mb: 1,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)'
                }
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={getActivityIcon(activity.type)}
                >
                  <Avatar sx={{ bgcolor: BRAND_COLOR }}>
                    {activity.clientName.charAt(0)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={activity.clientName}
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {activity.details}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(activity.date), {
                        addSuffix: true,
                        locale: es
                      })}
                    </Typography>
                  </Box>
                }
              />
              <Tooltip title="Enviar mensaje">
                <IconButton
                  size="small"
                  onClick={() => handleWhatsApp(activity.clientPhone, activity.clientName)}
                  sx={{
                    color: '#25D366',
                    '&:hover': {
                      bgcolor: 'rgba(37, 211, 102, 0.1)'
                    }
                  }}
                >
                  <WhatsAppIcon />
                </IconButton>
              </Tooltip>
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}