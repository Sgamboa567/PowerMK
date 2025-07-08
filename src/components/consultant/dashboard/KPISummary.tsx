'use client'
import { Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { KPICard } from '../shared/KPICard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import InventoryIcon from '@mui/icons-material/Inventory';

interface DashboardStats {
  monthSales: number;
  previousMonthSales: number;
  activeClients: number;
  newClientsToday: number;
  lowStockProducts: number;
  totalProducts: number;
}

export function KPISummary({ stats }: { stats: DashboardStats }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Grid
      component={motion.div}
      variants={container}
      initial="hidden"
      animate="show"
      container 
      spacing={3}
    >
      <Grid item xs={12} md={4} component={motion.div} variants={item}>
        <KPICard
          title="Ventas del Mes"
          value={`$${stats.monthSales.toLocaleString()}`}
          change={((stats.monthSales - stats.previousMonthSales) / (stats.previousMonthSales || 1)) * 100}
          icon={<ShoppingCartIcon />}
        />
      </Grid>
      <Grid item xs={12} md={4} component={motion.div} variants={item}>
        <KPICard
          title="Clientes Activos"
          value={stats.activeClients.toString()}
          badge={stats.newClientsToday > 0 ? `Nuevos: ${stats.newClientsToday}` : undefined}
          icon={<PersonAddIcon />}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <KPICard
          title="Inventario Crítico"
          value={`${stats.lowStockProducts}/${stats.totalProducts}`}
          highlight={stats.lowStockProducts > 0 ? 'warning' : undefined}
          icon={<InventoryIcon />}
        />
      </Grid>
    </Grid>
  );
}