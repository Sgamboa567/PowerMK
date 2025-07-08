'use client'
import { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { GoalProgress } from './GoalProgress';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BRAND_COLOR = '#FF90B3';

export function ChartsSummary() {
  const theme = useTheme();
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from('sales')
          .select('amount, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at');

        if (error) throw error;

        // Agrupar ventas por día
        const salesByDay = data.reduce((acc: any, sale: any) => {
          const date = format(new Date(sale.created_at), 'dd/MM', { locale: es });
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date] += sale.amount;
          return acc;
        }, {});

        const chartData = {
          labels: Object.keys(salesByDay),
          datasets: [
            {
              label: 'Ventas',
              data: Object.values(salesByDay),
              fill: true,
              borderColor: '#FF90B3',
              backgroundColor: 'rgba(255, 144, 179, 0.1)',
              tension: 0.4,
            },
          ],
        };

        setSalesData(chartData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `$${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value.toLocaleString()}`
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          elevation={0}
          sx={{
            p: 3,
            height: '400px',
            borderRadius: 2,
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(26,26,26,0.9)' 
              : 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
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
      <Grid item xs={12} md={4}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(26,26,26,0.9)' 
              : 'rgba(255,255,255,0.9)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255,144,179,0.1)' 
              : 'rgba(255,144,179,0.2)'}`,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Progreso de Meta
          </Typography>
          <GoalProgress />
        </Paper>
      </Grid>
    </Grid>
  );
}