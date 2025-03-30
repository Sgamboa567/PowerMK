'use client'
import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Fab, 
  SpeedDial, 
  SpeedDialAction,
  SpeedDialIcon 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import { KPICard } from '@/components/consultant/KPICard';
import { SalesChart } from '@/components/consultant/SalesChart';
import { InventoryHeatmap } from '@/components/consultant/InventoryHeatmap';
import { FollowupList } from '@/components/consultant/FollowupList';
import { BirthdayList } from '@/components/consultant/BirthdayList';
import { GoalProgress } from '@/components/consultant/GoalProgress';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

export default function ConsultantDashboard() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    monthSales: 0,
    previousMonthSales: 0,
    activeClients: 0,
    newClientsToday: 0,
    lowStockProducts: 0,
    totalProducts: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (session?.user?.id) {
        try {
          // Obtener ventas del mes actual
          const currentDate = new Date();
          const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

          const { data: currentMonthSales, error: salesError } = await supabase
            .from('sales')
            .select('amount')
            .eq('user_id', session.user.id)
            .gte('created_at', firstDayOfMonth.toISOString())
            .lte('created_at', lastDayOfMonth.toISOString());

          // Obtener ventas del mes anterior
          const firstDayOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
          const lastDayOfPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

          const { data: previousMonthSales } = await supabase
            .from('sales')
            .select('amount')
            .eq('user_id', session.user.id)
            .gte('created_at', firstDayOfPrevMonth.toISOString())
            .lte('created_at', lastDayOfPrevMonth.toISOString());

          // Obtener clientes activos
          const { data: activeClients } = await supabase
            .from('clients')
            .select('id')
            .eq('consultant_id', session.user.id);

          // Obtener nuevos clientes de hoy
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const { data: newClients } = await supabase
            .from('clients')
            .select('id')
            .eq('consultant_id', session.user.id)
            .gte('created_at', today.toISOString());

          // Obtener productos con bajo stock
          const { data: inventory } = await supabase
            .from('inventory')
            .select(`
              *,
              products (
                name,
                min_stock
              )
            `)
            .eq('user_id', session.user.id);

          setStats({
            monthSales: currentMonthSales?.reduce((sum, sale) => sum + sale.amount, 0) || 0,
            previousMonthSales: previousMonthSales?.reduce((sum, sale) => sum + sale.amount, 0) || 0,
            activeClients: activeClients?.length || 0,
            newClientsToday: newClients?.length || 0,
            lowStockProducts: inventory?.filter(item => 
              item.quantity <= (item.products?.min_stock || 5))?.length || 0,
            totalProducts: inventory?.length || 0
          });

        } catch (error) {
          console.error('Error fetching stats:', error);
        }
      }
    };

    fetchStats();
  }, [session]);

  const actions = [
    { icon: <ShoppingCartIcon />, name: 'Nueva Venta', action: () => {} },
    { icon: <PersonAddIcon />, name: 'Agregar Cliente', action: () => {} },
    { icon: <QrCodeScannerIcon />, name: 'Escanear Inventario', action: () => {} },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* KPIs */}
        <Grid item xs={12} md={4}>
          <KPICard
            title="Ventas del Mes"
            value={`$${stats.monthSales.toLocaleString()}`}
            change={((stats.monthSales - stats.previousMonthSales) / stats.previousMonthSales) * 100}
            icon={<ShoppingCartIcon />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard
            title="Clientes Activos"
            value={stats.activeClients.toString()}
            badge={stats.newClientsToday > 5 ? 'Nuevos: ' + stats.newClientsToday : undefined}
            icon={<PersonAddIcon />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard
            title="Inventario Crítico"
            value={`${stats.lowStockProducts}/${stats.totalProducts}`}
            highlight={stats.lowStockProducts > 0 ? 'warning' : undefined}
            icon={<QrCodeScannerIcon />}
          />
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <SalesChart />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <GoalProgress />
          </Paper>
        </Grid>

        {/* Widgets */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <FollowupList />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <BirthdayList />
          </Paper>
        </Grid>
      </Grid>

      {/* FAB Menu */}
      <SpeedDial
        ariaLabel="Acciones Rápidas"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}