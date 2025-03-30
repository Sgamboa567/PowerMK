'use client'
import { useTheme } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function SalesChart() {
  const theme = useTheme();

  const data = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Ventas',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: '#F5DADF',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme.palette.text.primary
        }
      },
      y: {
        grid: {
          color: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: theme.palette.text.primary
        }
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Ventas de la Semana
      </Typography>
      <Box height={300}>
        <Line data={data} options={options} />
      </Box>
    </Box>
  );
}