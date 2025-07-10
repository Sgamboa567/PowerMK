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
  Divider,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  IconButton,
  Badge
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
import { RecentSales } from '@/components/consultant/sales/RecentSales';
import { GoalProgress } from '@/components/consultant/dashboard/GoalProgress';
import { InventoryCard } from '@/components/consultant/inventory/InventoryCard';

// Iconos
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CategoryIcon from '@mui/icons-material/Category';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InsightsIcon from '@mui/icons-material/Insights';

const BRAND_COLOR = '#FF90B3';

const COLORS = {
  brand: BRAND_COLOR,
  brandDark: '#e57a9e',
  gold: '#c59d5f',
  lightGray: '#f4f4f4'
} as const;

// Definir tipos para las variantes
import type { Variants } from 'framer-motion';

// Definir las variantes de animación
const containerVariants: Variants = {
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      duration: 0.5,
      bounce: 0.3
    }
  }
};

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
  const [error, setError] = useState('');

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
          supabase
            .from('sales')
            .select('amount, created_at')
            .eq('user_id', session.user.id)
            .gte('created_at', firstDayOfMonth.toISOString())
            .lte('created_at', lastDayOfMonth.toISOString()),

          supabase
            .from('clients')
            .select('id, created_at')
            .eq('consultant_id', session.user.id),

          supabase
            .from('inventory')
            .select('*, products(name, min_stock)')
            .eq('user_id', session.user.id),

          supabase
            .from('goals')
            .select('amount')
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
        setError('No se pudieron cargar los datos del dashboard. Por favor, intenta de nuevo más tarde.');
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
      action: () => router.push('/consultant/inventory') 
    }
  ];

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} sx={{ color: BRAND_COLOR }} />
        <Typography variant="h6" color="text.secondary">
          Cargando dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        p: 0,
        maxWidth: '100%'
      }}
    >
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          minHeight: '100vh',
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Header con notificaciones e información rápida */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.mode === 'dark' ? '#fff' : '#333',
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            ¡Hola, {session?.user?.name?.split(' ')[0]}!
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton
              sx={{
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.05)',
                '&:hover': { 
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'rgba(0,0,0,0.1)' 
                }
              }}
              onClick={() => router.push('/consultant/notifications')}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
        </Box>

        {/* KPIs Principales */}
        <motion.div variants={itemVariants}>
          <KPISummary stats={stats} />
        </motion.div>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Perfil y Meta Mensual */}
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  borderRadius: 2,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(255,144,179,0.15), rgba(197,157,95,0.05))'
                    : 'linear-gradient(135deg, rgba(255,144,179,0.08), rgba(255,255,255,0.9))',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(197,157,95,0.1)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 90, md: 110 },
                    height: { xs: 90, md: 110 },
                    bgcolor: BRAND_COLOR,
                    border: `4px solid ${COLORS.gold}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    mb: 2
                  }}
                  src={session?.user?.image || undefined}
                >
                  {session?.user?.name?.charAt(0) || 'C'}
                </Avatar>

                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {session?.user?.name}
                </Typography>
                
                <Chip
                  label="Consultora Mary Kay"
                  sx={{
                    bgcolor: COLORS.brand,
                    color: 'white',
                    fontWeight: 500,
                    mb: 2
                  }}
                />
                
                <Divider sx={{ width: '100%', my: 2 }} />
                
                <Box sx={{ width: '100%', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Meta Mensual
                  </Typography>
                  <GoalProgress />
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => router.push('/consultant/account')}
                  sx={{
                    borderColor: BRAND_COLOR,
                    color: BRAND_COLOR,
                    '&:hover': {
                      borderColor: COLORS.brandDark,
                      backgroundColor: `${BRAND_COLOR}10`
                    },
                    mt: 'auto'
                  }}
                >
                  Ver perfil completo
                </Button>
              </Paper>
            </motion.div>
          </Grid>
          
          {/* Gráfico de ventas */}
          <Grid item xs={12} md={8}>
            <motion.div variants={itemVariants}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  height: '100%',
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(26,26,26,0.9)'
                    : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${theme.palette.mode === 'dark'
                    ? 'rgba(255,144,179,0.1)'
                    : 'rgba(255,144,179,0.2)'}`,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShowChartIcon sx={{ color: BRAND_COLOR }} />
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Tendencia de Ventas
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => router.push('/consultant/analytics')}>
                    <InsightsIcon sx={{ color: BRAND_COLOR }} />
                  </IconButton>
                </Box>
                
                <Box sx={{ flexGrow: 1 }}>
                  <ChartsSummary />
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Columna Izquierda: Inventario Crítico y Categorías */}
          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              {/* Inventario Crítico */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InventoryIcon sx={{ color: theme.palette.warning.main }} />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          Inventario Crítico
                        </Typography>
                      </Box>
                      <Button 
                        size="small" 
                        variant="outlined"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => router.push('/consultant/inventory')}
                        sx={{
                          borderColor: BRAND_COLOR,
                          color: BRAND_COLOR,
                          '&:hover': {
                            borderColor: COLORS.brandDark,
                            backgroundColor: `${BRAND_COLOR}10`
                          }
                        }}
                      >
                        Ver todo
                      </Button>
                    </Box>
                    <InventoryCard />
                  </Paper>
                </motion.div>
              </Grid>
              
              {/* Categorías Top */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon sx={{ color: BRAND_COLOR }} />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          Categorías Más Vendidas
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => console.log('Ver más categorías')}>
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    <TopCategories />
                  </Paper>
                </motion.div>
              </Grid>

              {/* Accesos rápidos */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
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
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                      Accesos Rápidos
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {[
                        { icon: <ShoppingCartIcon />, label: 'Nueva Venta', action: () => router.push('/consultant/sales/new'), color: '#4CAF50' },
                        { icon: <PersonAddIcon />, label: 'Nuevo Cliente', action: () => router.push('/consultant/clients/new'), color: '#2196F3' },
                        { icon: <InventoryIcon />, label: 'Añadir Inventario', action: () => router.push('/consultant/inventory'), color: '#FF9800' },
                        { icon: <LocalOfferIcon />, label: 'Promociones', action: () => router.push('/consultant/promotions'), color: '#E91E63' },
                      ].map((item, index) => (
                        <Grid item xs={6} key={index}>
                          <Card
                            elevation={0}
                            sx={{
                              bgcolor: theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.02)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                bgcolor: theme.palette.mode === 'dark'
                                  ? 'rgba(255,255,255,0.1)'
                                  : 'rgba(0,0,0,0.04)',
                              }
                            }}
                            onClick={item.action}
                          >
                            <CardContent sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                              p: 2
                            }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  p: 1.5,
                                  borderRadius: '50%',
                                  bgcolor: `${item.color}20`,
                                  color: item.color,
                                  mb: 1
                                }}
                              >
                                {item.icon}
                              </Box>
                              <Typography variant="body2">{item.label}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Columna Derecha: Seguimiento y Ventas Recientes */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* TrackingSummary */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <TrackingSummary />
                </motion.div>
              </Grid>
              
              {/* Ventas Recientes */}
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ShoppingCartIcon sx={{ color: BRAND_COLOR }} />
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          Ventas Recientes
                        </Typography>
                      </Box>
                      <Button 
                        size="small"
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/consultant/sales/new')}
                        sx={{
                          bgcolor: BRAND_COLOR,
                          '&:hover': {
                            bgcolor: COLORS.brandDark,
                          }
                        }}
                      >
                        Nueva Venta
                      </Button>
                    </Box>
                    <RecentSales />
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* SpeedDial para acciones rápidas */}
        <SpeedDial
          ariaLabel="Acciones Rápidas"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 32 },
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