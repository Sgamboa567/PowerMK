'use client'
import { Box, Grid, Paper, Typography, useTheme, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupIcon from '@mui/icons-material/Group';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InventoryIcon from '@mui/icons-material/Inventory';

const BRAND_COLOR = '#FF90B3';

interface Metric {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  tooltip?: string;
}

export function MetricsOverview() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const today = new Date();
        const yesterday = subDays(today, 1);

        // Obtener métricas del día actual
        const { data: todayData, error: todayError } = await supabase
          .from('sales')
          .select('amount')
          .eq('consultant_id', session.user.id)
          .gte('created_at', startOfDay(today).toISOString())
          .lte('created_at', endOfDay(today).toISOString());

        if (todayError) throw todayError;

        // Obtener métricas del día anterior
        const { data: yesterdayData, error: yesterdayError } = await supabase
          .from('sales')
          .select('amount')
          .eq('consultant_id', session.user.id)
          .gte('created_at', startOfDay(yesterday).toISOString())
          .lte('created_at', endOfDay(yesterday).toISOString());

        if (yesterdayError) throw yesterdayError;

        const todayTotal = todayData?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
        const yesterdayTotal = yesterdayData?.reduce((sum, sale) => sum + sale.amount, 0) || 1;
        const change = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;

        // Configurar métricas
        const metricsData: Metric[] = [
          {
            title: 'Ventas de Hoy',
            value: `$${todayTotal.toLocaleString()}`,
            change,
            icon: <ShowChartIcon />,
            tooltip: 'Comparado con ayer'
          },
          {
            title: 'Ticket Promedio',
            value: `$${todayData?.length ? Math.round(todayTotal / todayData.length).toLocaleString() : 0}`,
            icon: <LocalOfferIcon />
          },
          {
            title: 'Nuevos Clientes',
            value: '0', // Implementar lógica real
            icon: <GroupIcon />
          },
          {
            title: 'Stock Crítico',
            value: '0', // Implementar lógica real
            icon: <InventoryIcon />
          }
        ];

        setMetrics(metricsData);

      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError('No se pudieron cargar las métricas');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [session]);

  if (loading) {
    return (
      <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(26,26,26,0.9)'
                : 'rgba(255,255,255,0.9)',
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(255,144,179,0.1)'
                : '1px solid rgba(255,144,179,0.2)',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: `${BRAND_COLOR}15`,
                  color: BRAND_COLOR,
                  mr: 1
                }}
              >
                {metric.icon}
              </Box>
              <Typography variant="subtitle2" color="text.secondary">
                {metric.title}
              </Typography>
            </Box>

            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
              {metric.value}
            </Typography>

            {metric.change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {metric.change >= 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography
                  variant="caption"
                  color={metric.change >= 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}