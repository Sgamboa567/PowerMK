'use client'
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Divider,
  LinearProgress,
  Badge,
  useTheme,
  CircularProgress,
  Button,
  Grid,  // Añadir Grid a las importaciones
  Chip   // También falta la importación de Chip para los logros
} from '@mui/material';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EditIcon from '@mui/icons-material/Edit';

const BRAND_COLOR = '#FF90B3';

interface ConsultantStats {
  totalSales: number;
  totalClients: number;
  rank: string;
  nextRankProgress: number;
  achievements: string[];
}

export function ConsultantProfile() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<ConsultantStats>({
    totalSales: 0,
    totalClients: 0,
    rank: 'Consultora',
    nextRankProgress: 0,
    achievements: []
  });

  useEffect(() => {
    const fetchConsultantStats = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);

        // Obtener ventas totales
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('amount')
          .eq('consultant_id', session.user.id);

        if (salesError) throw salesError;

        // Obtener total de clientes
        const { count: clientsCount, error: clientsError } = await supabase
          .from('clients')
          .select('id', { count: 'exact' })
          .eq('consultant_id', session.user.id);

        if (clientsError) throw clientsError;

        const totalSales = salesData?.reduce((sum, sale) => sum + sale.amount, 0) || 0;

        // Calcular rango basado en ventas totales
        let rank = 'Consultora';
        let nextRankProgress = 0;

        if (totalSales >= 1000000) {
          rank = 'Consultora Senior';
          nextRankProgress = (totalSales - 1000000) / 1000000 * 100;
        } else {
          nextRankProgress = totalSales / 1000000 * 100;
        }

        // Lista de logros (podría venir de una tabla en la base de datos)
        const achievements = [
          'Primera venta',
          '10 clientes registrados',
          'Meta mensual alcanzada'
        ];

        setStats({
          totalSales,
          totalClients: clientsCount || 0,
          rank,
          nextRankProgress: Math.min(nextRankProgress, 100),
          achievements
        });

      } catch (error) {
        console.error('Error fetching consultant stats:', error);
        setError('No se pudo cargar la información del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultantStats();
  }, [session]);

  if (loading) {
    return (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                component="span"
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: BRAND_COLOR,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${theme.palette.background.paper}`
                }}
              >
                <WorkspacePremiumIcon sx={{ fontSize: 14, color: 'white' }} />
              </Box>
            }
          >
            <Avatar
              sx={{ width: 80, height: 80 }}
              src={session?.user?.image || undefined}
            />
          </Badge>
          <Box>
            <Typography variant="h6">
              {session?.user?.name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {stats.rank}
            </Typography>
          </Box>
        </Box>
        <Button
          startIcon={<EditIcon />}
          variant="outlined"
          size="small"
          sx={{
            borderColor: BRAND_COLOR,
            color: BRAND_COLOR,
            '&:hover': {
              borderColor: BRAND_COLOR,
              bgcolor: `${BRAND_COLOR}10`
            }
          }}
        >
          Editar Perfil
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Progreso hacia {stats.nextRankProgress >= 100 ? 'Director' : 'Consultora Senior'}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={stats.nextRankProgress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: BRAND_COLOR,
              borderRadius: 4
            }
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {stats.nextRankProgress.toFixed(1)}% completado
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.02)'
            }}
          >
            <Typography variant="h6">${stats.totalSales.toLocaleString()}</Typography>
            <Typography variant="body2" color="text.secondary">Ventas Totales</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.02)'
            }}
          >
            <Typography variant="h6">{stats.totalClients}</Typography>
            <Typography variant="body2" color="text.secondary">Clientes Totales</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon sx={{ color: BRAND_COLOR }} />
          Logros
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {stats.achievements.map((achievement, index) => (
            <Chip
              key={index}
              label={achievement}
              sx={{
                bgcolor: `${BRAND_COLOR}15`,
                color: BRAND_COLOR,
                '& .MuiChip-label': {
                  px: 1
                }
              }}
            />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}