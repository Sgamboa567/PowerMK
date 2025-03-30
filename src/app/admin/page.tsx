'use client'
import { Box, Grid, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
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
import PeopleIcon from '@mui/icons-material/People';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WarningIcon from '@mui/icons-material/Warning';
import { KPICard } from '@/components/admin/KPICard';
import { ConsultantsTable } from '@/components/admin/ConsultantsTable';

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

export default function AdminDashboard() {
  const theme = useTheme();

  const growthChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Nuevas Consultoras',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4
      },
      {
        label: 'Nuevos Clientes',
        data: [8, 15, 25, 12, 18, 22],
        borderColor: '#F5DADF',
        backgroundColor: 'rgba(245, 218, 223, 0.1)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary
        }
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
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Consultoras Activas"
            value="25"
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Nuevos Clientes"
            value="123"
            subtitle="Últimos 30 días"
            icon={<GroupAddIcon />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Ventas Totales"
            value="$15,420"
            icon={<MonetizationOnIcon />}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <KPICard
            title="Pagos Pendientes"
            value="3"
            icon={<WarningIcon />}
            highlight="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3,
              background: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'white'
            }}
          >
            <Typography variant="h6" gutterBottom>
              Crecimiento Mensual
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={growthChartData}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <ConsultantsTable />
      </Box>
    </Box>
  );
}