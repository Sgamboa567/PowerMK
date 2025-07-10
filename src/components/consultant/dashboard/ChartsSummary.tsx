'use client'
import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export function ChartsSummary() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: 'Ventas',
        data: [] as number[],
        backgroundColor: 'rgba(255, 144, 179, 0.2)',
        borderColor: '#FF90B3',
        tension: 0.4,
        fill: true,
      },
    ],
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const today = new Date();
        
        // Obtener ventas de los últimos 7 días
        const dates = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(today, 6 - i);
          return {
            date,
            label: format(date, 'd MMM', { locale: es }),
            formatted: format(date, 'yyyy-MM-dd')
          };
        });

        const { data: salesByDay, error } = await supabase
          .from('sales')
          .select('amount, created_at')
          .eq('user_id', session.user.id)
          .gte('created_at', dates[0].date.toISOString())
          .lte('created_at', new Date(today.setHours(23, 59, 59, 999)).toISOString());

        if (error) throw error;

        const dailySales = dates.map(day => {
          const dayStart = new Date(day.date);
          dayStart.setHours(0, 0, 0, 0);
          
          const dayEnd = new Date(day.date);
          dayEnd.setHours(23, 59, 59, 999);
          
          const salesForDay = salesByDay?.filter(sale => 
            new Date(sale.created_at) >= dayStart && 
            new Date(sale.created_at) <= dayEnd
          ) || [];
          
          const total = salesForDay.reduce((sum, sale) => sum + sale.amount, 0);
          return total;
        });

        const chartData = {
          labels: dates.map(d => d.label),
          datasets: [
            {
              label: 'Ventas',
              data: dailySales,
              backgroundColor: 'rgba(255, 144, 179, 0.2)',
              borderColor: '#FF90B3',
              tension: 0.4,
              fill: true,
            },
          ],
        };

        setSalesData(chartData);

      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [session]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
        titleColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
        bodyColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12}>
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
              : '1px solid rgba(255,144,179,0.2)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Ventas Recientes
          </Typography>
          
          {loading ? (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Cargando datos...
            </Box>
          ) : salesData.labels?.length > 0 ? (
            <Line data={salesData} options={options} />
          ) : (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              No hay datos de ventas disponibles
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}