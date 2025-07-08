'use client'
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  useTheme,
  CircularProgress,
  Tooltip,
  Chip
} from '@mui/material';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import InventoryIcon from '@mui/icons-material/Inventory';
import CakeIcon from '@mui/icons-material/Cake';
import EventIcon from '@mui/icons-material/Event';
import CloseIcon from '@mui/icons-material/Close';

const BRAND_COLOR = '#FF90B3';

interface Notification {
  id: string;
  type: 'inventory' | 'birthday' | 'followup' | 'goal';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function NotificationsPanel() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <InventoryIcon />;
      case 'birthday':
        return <CakeIcon />;
      case 'followup':
        return <EventIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

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

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('consultant_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);

      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('No se pudieron cargar las notificaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark'
          ? 'rgba(26,26,26,0.9)'
          : 'rgba(255,255,255,0.9)',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(255,144,179,0.1)'
          : '1px solid rgba(255,144,179,0.2)',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsActiveIcon sx={{ color: BRAND_COLOR }} />
          </Badge>
          <Typography variant="h6">Notificaciones</Typography>
        </Box>
        {unreadCount > 0 && (
          <Chip
            label={`${unreadCount} nueva${unreadCount !== 1 ? 's' : ''}`}
            size="small"
            sx={{
              bgcolor: `${BRAND_COLOR}20`,
              color: BRAND_COLOR,
              fontWeight: 500
            }}
          />
        )}
      </Box>

      <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No hay notificaciones"
              secondary="Estás al día con todo"
              sx={{ textAlign: 'center' }}
            />
          </ListItem>
        ) : (
          notifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                bgcolor: notification.read
                  ? 'transparent'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.02)',
                borderLeft: `4px solid ${getPriorityColor(notification.priority)}`,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)'
                }
              }}
            >
              <ListItemIcon sx={{ color: BRAND_COLOR }}>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: es
                      })}
                    </Typography>
                  </Box>
                }
              />
              {!notification.read && (
                <Tooltip title="Marcar como leída">
                  <IconButton
                    size="small"
                    onClick={() => handleMarkAsRead(notification.id)}
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        color: BRAND_COLOR
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}