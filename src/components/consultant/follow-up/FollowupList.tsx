'use client'
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Paper,
  CircularProgress,
  Tooltip,
  useTheme,
  Chip,
  Button
} from '@mui/material';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AddTaskIcon from '@mui/icons-material/AddTask';

const BRAND_COLOR = '#FF90B3';

interface FollowUp {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  lastPurchase: string;
  nextFollowUp: string | null;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

export function FollowupList() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    const fetchFollowUps = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        // Obtener clientes con su última compra
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select(`
            id,
            name,
            phone,
            sales (
              created_at
            ),
            follow_ups (
              next_date,
              priority,
              notes
            )
          `)
          .eq('consultant_id', session.user.id);

        if (clientsError) throw clientsError;

        // Procesar datos para seguimiento
        const processedFollowUps = clients
          ?.map(client => {
            const lastSale = client.sales?.sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            const lastFollowUp = client.follow_ups?.sort((a, b) =>
              new Date(b.next_date).getTime() - new Date(a.next_date).getTime()
            )[0];

            if (!lastSale) return null;

            const daysSinceLastPurchase = differenceInDays(new Date(), new Date(lastSale.created_at));
            let priority: 'high' | 'medium' | 'low' = 'low';

            if (daysSinceLastPurchase > 90) priority = 'high';
            else if (daysSinceLastPurchase > 45) priority = 'medium';

            return {
              id: client.id,
              clientId: client.id,
              clientName: client.name,
              clientPhone: client.phone,
              lastPurchase: lastSale.created_at,
              nextFollowUp: lastFollowUp?.next_date || null,
              priority: lastFollowUp?.priority || priority,
              notes: lastFollowUp?.notes
            };
          })
          .filter(Boolean)
          .sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a!.priority] - priorityOrder[b!.priority];
          });

        setFollowUps(processedFollowUps as FollowUp[]);
      } catch (error) {
        console.error('Error fetching follow-ups:', error);
        setError('No se pudieron cargar los seguimientos');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [session]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `¡Hola ${name}! Soy tu consultora Mary Kay. ¿Cómo estás? Me gustaría saber cómo te han funcionado los productos 😊`
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventAvailableIcon sx={{ color: BRAND_COLOR }} />
          <Typography variant="h6">Seguimientos Pendientes</Typography>
        </Box>
        <Button
          startIcon={<AddTaskIcon />}
          sx={{
            color: BRAND_COLOR,
            borderColor: BRAND_COLOR,
            '&:hover': {
              borderColor: BRAND_COLOR,
              bgcolor: `${BRAND_COLOR}10`
            }
          }}
          variant="outlined"
          size="small"
        >
          Nuevo Seguimiento
        </Button>
      </Box>

      <List>
        {followUps.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No hay seguimientos pendientes
          </Typography>
        ) : (
          followUps.map((followUp) => (
            <ListItem
              key={followUp.id}
              sx={{
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.02)',
                borderRadius: 1,
                mb: 1,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)'
                },
                borderLeft: `4px solid ${getPriorityColor(followUp.priority)}`
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getPriorityColor(followUp.priority) }}>
                  {followUp.priority === 'high' ? <PriorityHighIcon /> : followUp.clientName.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={followUp.clientName}
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2">
                      Última compra: {format(new Date(followUp.lastPurchase), "d 'de' MMMM, yyyy", { locale: es })}
                    </Typography>
                    {followUp.nextFollowUp && (
                      <Typography variant="caption" color="text.secondary">
                        Próximo seguimiento: {format(new Date(followUp.nextFollowUp), "d 'de' MMMM", { locale: es })}
                      </Typography>
                    )}
                    {followUp.notes && (
                      <Typography variant="caption" color="text.secondary">
                        Nota: {followUp.notes}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                <Chip
                  label={followUp.priority === 'high' ? 'Urgente' : 'Seguimiento'}
                  size="small"
                  sx={{
                    bgcolor: `${getPriorityColor(followUp.priority)}20`,
                    color: getPriorityColor(followUp.priority),
                    fontWeight: 500
                  }}
                />
                <Tooltip title="Contactar">
                  <IconButton
                    size="small"
                    onClick={() => handleWhatsApp(followUp.clientPhone, followUp.clientName)}
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
              </Box>
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}