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
  Badge
} from '@mui/material';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { format, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import CakeIcon from '@mui/icons-material/Cake';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

const BRAND_COLOR = '#FF90B3';

interface Birthday {
  id: string;
  name: string;
  birthday: string;
  phone: string;
  lastPurchase?: string;
}

export function BirthdayList() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);

  useEffect(() => {
    const fetchBirthdays = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clients')
          .select(`
            id,
            name,
            birthday,
            phone,
            sales (
              created_at
            )
          `)
          .eq('consultant_id', session.user.id)
          .not('birthday', 'is', null);

        if (error) throw error;

        // Filtrar cumpleaños del mes actual
        const currentMonth = new Date();
        const monthBirthdays = data
          ?.filter(client => client.birthday && isSameMonth(new Date(client.birthday), currentMonth))
          .map(client => ({
            id: client.id,
            name: client.name,
            birthday: client.birthday,
            phone: client.phone,
            lastPurchase: client.sales?.[0]?.created_at
          }))
          .sort((a, b) => new Date(a.birthday).getDate() - new Date(b.birthday).getDate());

        setBirthdays(monthBirthdays || []);
      } catch (error) {
        console.error('Error fetching birthdays:', error);
        setError('No se pudieron cargar los cumpleaños');
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, [session]);

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `¡Feliz cumpleaños ${name}! 🎂 Te deseo un día maravilloso. Como regalo especial, tengo una sorpresa para ti en tu próxima compra Mary Kay 🎁`
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <CakeIcon sx={{ color: BRAND_COLOR }} />
        <Typography variant="h6">Cumpleaños del Mes</Typography>
      </Box>

      <List>
        {birthdays.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No hay cumpleaños este mes
          </Typography>
        ) : (
          birthdays.map((birthday) => (
            <ListItem
              key={birthday.id}
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
                  badgeContent={
                    <CardGiftcardIcon
                      sx={{
                        fontSize: 16,
                        color: BRAND_COLOR
                      }}
                    />
                  }
                >
                  <Avatar sx={{ bgcolor: BRAND_COLOR }}>
                    {birthday.name.charAt(0)}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={birthday.name}
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2">
                      {format(new Date(birthday.birthday), "d 'de' MMMM", { locale: es })}
                    </Typography>
                    {birthday.lastPurchase && (
                      <Typography variant="caption" color="text.secondary">
                        Última compra: {format(new Date(birthday.lastPurchase), "d 'de' MMMM, yyyy", { locale: es })}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <Tooltip title="Enviar felicitación">
                <IconButton
                  onClick={() => handleWhatsApp(birthday.phone, birthday.name)}
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