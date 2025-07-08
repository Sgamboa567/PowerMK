'use client'
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Typography, CircularProgress } from '@mui/material';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { format, startOfWeek, eachDayOfInterval, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';

// Registrar componentes de Chart.js
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

export function SalesChart() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        // Obtener fecha de inicio (7 días atrás)
        const startDate = startOfWeek(new Date());
        const days = eachDayOfInterval({
          start: startDate,
          end: addDays(startDate, 6)
        });

        // Obtener ventas de la última semana
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('amount, created_at')
          .eq('user_id', session.user.id)
          .gte('created_at', startDate.toISOString())
          .order('created_at');

        if (salesError) throw salesError;

        // Procesar datos para el gráfico
        const dailySales = days.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          return salesData
            ?.filter(sale => sale.created_at.startsWith(dayStr))
            .reduce((sum, sale) => sum + sale.amount, 0) || 0;
        });

        setChartData({
          labels: days.map(day => format(day, 'EEE', { locale: es })),
          datasets: [
            {
              label: 'Ventas Diarias',
              data: dailySales,
              borderColor: BRAND_COLOR,
              backgroundColor: `${BRAND_COLOR}33`,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: BRAND_COLOR,
              pointBorderColor: 'white',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
            }
          ]
        });

      } catch (error) {
        console.error('Error fetching sales data:', error);
        setError('No se pudieron cargar los datos de ventas');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [session]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        titleFont: { weight: '500' },
        bodyColor: '#666',
        bodyFont: { size: 13 },
        borderColor: BRAND_COLOR,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items: any) => 'Ventas del día',
          label: (item: any) => `$${item.raw.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [5, 5]
        },
        ticks: {
          font: {
            size: 12
          },
          callback: (value: number) => `$${value.toLocaleString()}`
        }
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 300, position: 'relative' }}>
      <Line data={chartData} options={options} />
    </Box>
  );
}