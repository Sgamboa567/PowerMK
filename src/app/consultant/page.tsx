'use client'
import { useState, useEffect } from 'react';
import { 
  Box, 
  Container,
  Grid,
  Paper,
  Typography, 
  SpeedDial, 
  SpeedDialAction,
  Avatar,
  useTheme,
  useMediaQuery,
  Chip,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Componentes del Dashboard
import { KPISummary } from '@/components/consultant/dashboard/KPISummary';
import { ChartsSummary } from '@/components/consultant/dashboard/ChartsSummary';
import { TrackingSummary } from '@/components/consultant/dashboard/TrackingSummary';
import { TopCategories } from '@/components/consultant/dashboard/TopCategories';
import { MetricsOverview } from '@/components/consultant/dashboard/MetricsOverview';
import { GoalProgress } from '@/components/consultant/dashboard/GoalProgress';
import { InventoryCard } from '@/components/consultant/inventory/InventoryCard';

// Iconos
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InventoryIcon from '@mui/icons-material/Inventory';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';

const BRAND_COLOR = '#FF90B3';

const COLORS = {
  brand: BRAND_COLOR,
  brandDark: '#e57a9e',
  gold: '#c59d5f',
  lightGray: '#f4f4f4'
} as const;

export default function ConsultantDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: session } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    monthSales: 0,
    previousMonthSales: 0,
    activeClients: 0,
    newClientsToday: 0,
    lowStockProducts: 0,
    totalProducts: 0,
    goalProgress: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // Animaciones compartidas
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  // Efecto mejorado para cargar datos
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);

        // Fetch current month sales and data
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const [salesResponse, clientsResponse, inventoryResponse, goalResponse] = await Promise.all([
          // Ventas del mes actual
          supabase
            .from('sales')
            .select('amount, created_at')
            .eq('user_id', session.user.id)
            .gte('created_at', firstDayOfMonth.toISOString())
            .lte('created_at', lastDayOfMonth.toISOString()),

          // Clientes activos
          supabase
            .from('clients')
            .select('id, created_at')
            .eq('consultant_id', session.user.id),

          // Inventario
          supabase
            .from('inventory')
            .select('*, products(name, min_stock)')
            .eq('user_id', session.user.id),

          // Meta mensual
          supabase
            .from('goals')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
        ]);

        // Procesar datos
        const monthSales = salesResponse.data?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
        const activeClients = clientsResponse.data?.length || 0;
        const newClientsToday = clientsResponse.data?.filter(client => 
          new Date(client.created_at).toDateString() === new Date().toDateString()
        ).length || 0;
        
        const lowStockProducts = inventoryResponse.data?.filter(item => 
          item.quantity <= (item.products?.min_stock || 5)
        ).length || 0;

        const goalAmount = goalResponse.data?.amount || 0;
        const goalProgress = goalAmount > 0 ? (monthSales / goalAmount) * 100 : 0;

        setStats({
          monthSales,
          previousMonthSales: 0, 
          activeClients,
          newClientsToday,
          lowStockProducts,
          totalProducts: inventoryResponse.data?.length || 0,
          goalProgress
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Implementar manejo de errores visual
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [session]);

  const actions = [
    { 
      icon: <ShoppingCartIcon />, 
      name: 'Nueva Venta', 
      action: () => router.push('/consultant/sales/new') 
    },
    { 
      icon: <PersonAddIcon />, 
      name: 'Nuevo Cliente', 
      action: () => router.push('/consultant/clients/new') 
    },
    { 
      icon: <InventoryIcon />, 
      name: 'Añadir Producto', 
      action: () => router.push('/consultant/inventory/new') 
    }
  ];

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 4,
        px: { xs: 2, md: 4 }
      }}
    >
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          minHeight: '100vh',
          width: '100%' // Asegura que ocupe todo el ancho disponible
        }}
      >
        {/* Header con información de la consultora */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 }, // Padding responsive
            mb: 6, // Aumentado de 4 a 6
            borderRadius: 2,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255,144,179,0.1), rgba(197,157,95,0.05))'
              : 'linear-gradient(135deg, rgba(255,144,179,0.08), rgba(197,157,95,0.02))',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(197,157,95,0.1)'}`,
          }}
        >
          <Avatar
            sx={{
              width: { xs: 90, md: 110 },
              height: { xs: 90, md: 110 },
              bgcolor: BRAND_COLOR,
              border: `4px solid ${COLORS.gold}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
            src={session?.user?.image || undefined}
          >
            {session?.user?.name?.charAt(0) || 'C'}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight={600}>
                {session?.user?.name}
              </Typography>
              <Chip
                label="Consultora Mary Kay"
                sx={{
                  bgcolor: COLORS.brand,
                  color: 'white',
                  fontWeight: 500,
                  '& .MuiChip-label': { px: 2 }
                }}
              />
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {session?.user?.email}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<ShoppingCartIcon />}
                label={`$${stats.monthSales.toLocaleString()} en ventas este mes`}
                variant="outlined"
                sx={{ borderColor: COLORS.brand, color: COLORS.brand }}
              />
              <Chip
                icon={<PersonAddIcon />}
                label={`${stats.activeClients} clientes activos`}
                variant="outlined"
                sx={{ borderColor: COLORS.brand, color: COLORS.brand }}
              />
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={4}>
          {/* KPIs y Métricas */}
          <Grid item xs={12}>
            <Box mb={4}> {/* Añadido margin bottom */}
              <motion.div variants={itemVariants}>
                <KPISummary stats={stats} />
              </motion.div>
            </Box>
          </Grid>

          {/* Gráficos y Meta */}
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 }, // Padding responsive
                  height: '100%',
                  borderRadius: 2,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(26,26,26,0.9)'
                    : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${theme.palette.mode === 'dark'
                    ? 'rgba(255,144,179,0.1)'
                    : 'rgba(255,144,179,0.2)'}`,
                }}
              >
                <ChartsSummary />
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(26,26,26,0.9)'
                    : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${theme.palette.mode === 'dark'
                    ? 'rgba(255,144,179,0.1)'
                    : 'rgba(255,144,179,0.2)'}`,
                }}
              >
                <GoalProgress />
              </Paper>
            </motion.div>
          </Grid>

          {/* Inventario y Seguimiento */}
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <InventoryCard />
            </motion.div>
          </Grid>

          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <TrackingSummary />
            </motion.div>
          </Grid>
        </Grid>

        {/* SpeedDial para acciones rápidas */}
        <SpeedDial
          ariaLabel="Acciones Rápidas"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 32 }, // Posición responsive
            right: { xs: 16, md: 32 },
            '& .MuiFab-primary': {
              width: 64,
              height: 64,
              bgcolor: BRAND_COLOR,
              '&:hover': {
                bgcolor: '#e57a9e',
                transform: 'scale(1.05)',
              }
            }
          }}
          icon={<SpeedDialIcon />}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.action}
              sx={{
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(26,26,26,0.95)'
                  : 'rgba(255,255,255,0.95)',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(197,157,95,0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </SpeedDial>
      </Box>
    </Container>
  );
}