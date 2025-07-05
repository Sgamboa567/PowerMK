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
  SpeedDialIcon,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  Avatar,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { KPICard } from '@/components/consultant/KPICard';
import { SalesChart } from '@/components/consultant/SalesChart';
import { InventoryHeatmap } from '@/components/consultant/InventoryHeatmap';
import { FollowupList } from '@/components/consultant/FollowupList';
import { BirthdayList } from '@/components/consultant/BirthdayList';
import { GoalProgress } from '@/components/consultant/GoalProgress';
import { useSession, signOut } from 'next-auth/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Constantes para estilos
const DRAWER_WIDTH = 240;
const BRAND_COLOR = '#FF90B3';

export default function ConsultantDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: session } = useSession();
  const router = useRouter();
  
  // Estados para el menú móvil y el menú de perfil
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Estado para las estadísticas
  const [stats, setStats] = useState({
    monthSales: 0,
    previousMonthSales: 0,
    activeClients: 0,
    newClientsToday: 0,
    lowStockProducts: 0,
    totalProducts: 0
  });

  // Cargar datos al iniciar
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
    
    // Make sure navbar is hidden
    document.body.classList.add('hide-navbar');
    
    fetchStats();
    
    // Cleanup function
    return () => {
      document.body.classList.remove('hide-navbar');
    };
  }, [session]);

  // Acciones para el SpeedDial
  const actions = [
    { icon: <ShoppingCartIcon />, name: 'Nueva Venta', action: () => router.push('/consultant/sales/new') },
    { icon: <PersonAddIcon />, name: 'Agregar Cliente', action: () => router.push('/consultant/clients/new') },
    { icon: <QrCodeScannerIcon />, name: 'Escanear Inventario', action: () => router.push('/consultant/inventory/scan') },
  ];

  // Manejadores para el menú de perfil
  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileMenuAnchor(null);
  };

  // Actualiza este manejador
  const handleEditProfile = () => {
    handleCloseProfileMenu();
    router.push('/consultant/account');  // Ahora redirige a la página de cuenta
  };

  const handleSettings = () => {
    handleCloseProfileMenu();
    router.push('/consultant/settings');
  };

  const handleLogout = async () => {
    handleCloseProfileMenu();
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const handleUserProfile = () => {
    handleCloseProfileMenu();
    router.push('/consultant/account');  // This should match the path to your new account page
  };

  // Items de navegación para el menú lateral
  const navItems = [
    { text: 'Dashboard', icon: <ShoppingCartIcon />, path: '/consultant' },
    { text: 'Clientes', icon: <PersonAddIcon />, path: '/consultant/clients' },
    { text: 'Inventario', icon: <QrCodeScannerIcon />, path: '/consultant/inventory' },
    { text: 'Ventas', icon: <ShoppingCartIcon />, path: '/consultant/sales' },
  ];

  // Contenido del drawer para móvil
  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,144,179,0.1)',
        }}
      >
        <Avatar 
          sx={{ 
            width: 64, 
            height: 64, 
            mb: 1, 
            bgcolor: BRAND_COLOR,
            border: '2px solid white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
          }}
          src={session?.user?.image || undefined}
        >
          {session?.user?.name?.charAt(0) || 'C'}
        </Avatar>
        <Typography variant="h6" noWrap component="div" sx={{ textAlign: 'center' }}>
          {session?.user?.name || 'Consultora'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
          {session?.user?.email}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            px: 1.5,
            py: 0.5,
            bgcolor: BRAND_COLOR, 
            borderRadius: 5,
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.7rem',
            letterSpacing: 0.5
          }}
        >
          Consultora Mary Kay
        </Typography>
      </Box>
      <Divider />
      
      {/* Navegación principal */}
      <List sx={{ pt: 1 }}>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => {
              router.push(item.path);
              if (isMobile) setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              }
            }}
          >
            <ListItemIcon sx={{ color: BRAND_COLOR, minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ mt: 1, mb: 1 }} />
      
      {/* Configuración y cuenta */}
      <List sx={{ px: 1 }}>
        <ListItem 
          button 
          onClick={() => {
            router.push('/consultant/account');
            if (isMobile) setDrawerOpen(false);
          }}
          sx={{ 
            borderRadius: 1,
            mb: 0.5,
            bgcolor: `${BRAND_COLOR}15`,
            '&:hover': {
              bgcolor: `${BRAND_COLOR}25`,
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Mi cuenta Mary Kay" />
        </ListItem>
        
        <ListItem 
          button 
          onClick={() => {
            handleEditProfile();
            if (isMobile) setDrawerOpen(false);
          }}
          sx={{ 
            borderRadius: 1,
            mb: 0.5
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Editar Perfil" />
        </ListItem>
        
        <ListItem 
          button 
          onClick={() => {
            handleSettings();
            if (isMobile) setDrawerOpen(false);
          }}
          sx={{ 
            borderRadius: 1,
          mb: 0.5
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Configuración" />
        </ListItem>
      </List>
      
      {/* Espaciador que empuja el botón de cerrar sesión al fondo */}
      <Box sx={{ flexGrow: 1 }} />
      
      {/* Botón de cerrar sesión */}
      <List sx={{ px: 1, pb: 2 }}>
        <ListItem 
          button 
          onClick={() => {
            handleLogout();
            if (isMobile) setDrawerOpen(false);
          }}
          sx={{ 
            borderRadius: 1,
            color: theme.palette.error.main,
            '&:hover': {
              bgcolor: theme.palette.error.light + '15',
            },
            '& .MuiListItemIcon-root': {
              color: theme.palette.error.main,
              minWidth: 40
            }
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh'
    }}>
      {/* Barra superior para móvil */}
      {isMobile && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bgcolor: theme.palette.mode === 'dark' ? '#1A1A1A' : '#fff',
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: 1200, // Increase z-index to be above drawer
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            PowerMK
          </Typography>
          <Avatar
            sx={{ 
              width: 40, 
              height: 40,
              cursor: 'pointer',
              bgcolor: BRAND_COLOR 
            }}
            src={session?.user?.image || undefined}
            onClick={handleOpenProfileMenu}
          >
            {session?.user?.name?.charAt(0) || 'C'}
          </Avatar>
        </Box>
      )}

      {/* Drawer para navegación en móvil */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            zIndex: 1100, // Make sure drawer is below the top bar
          },
          display: { xs: 'block', md: isMobile ? 'none' : 'block' }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Menú desplegable de perfil */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleCloseProfileMenu}
        sx={{
          mt: 1.5,
          '& .MuiPaper-root': {
            borderRadius: 2,
            minWidth: 280, // Aumentado el ancho
            boxShadow: '0px 8px 30px rgba(0,0,0,0.15)',
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: theme.palette.mode === 'dark' ? '#1A1A1A' : 'white',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Cabecera del perfil */}
        <Box 
          sx={{ 
            pt: 4, 
            px: 3, 
            pb: 3, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            background: `linear-gradient(135deg, ${BRAND_COLOR}20, ${BRAND_COLOR}05)`,
            borderRadius: '8px 8px 0 0',
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to top, rgba(255,255,255,0.8), transparent)',
              borderRadius: '0 0 8px 8px',
              opacity: theme.palette.mode === 'dark' ? 0.05 : 0.2
            }
          }}
        >
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mb: 1.5, 
              bgcolor: BRAND_COLOR, 
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              border: '3px solid white',
              position: 'relative',
              zIndex: 2
            }}
            src={session?.user?.image || undefined}
          >
            {session?.user?.name?.charAt(0) || 'C'}
          </Avatar>
          <Typography variant="h6" fontWeight="600" align="center" sx={{ mb: 0.5 }}>
            {session?.user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
            {session?.user?.email}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              px: 2,
              py: 0.5,
              bgcolor: BRAND_COLOR, 
              borderRadius: 5,
              color: 'white',
              fontWeight: 'bold',
              letterSpacing: 0.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            Consultora Mary Kay
          </Typography>
        </Box>
        
        <Box sx={{ pt: 2, px: 1 }}>
          <MenuItem 
            onClick={handleUserProfile} 
            sx={{ 
              py: 1.5,
              borderRadius: 1.5,
              mb: 1,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              }
            }}
          >
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Mi cuenta Mary Kay" />
          </MenuItem>
          
          <MenuItem 
            onClick={handleEditProfile} 
            sx={{ 
              py: 1.5,
              borderRadius: 1.5,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              }
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Editar perfil" />
          </MenuItem>
          
          <MenuItem 
            onClick={handleSettings} 
            sx={{ 
              py: 1.5,
              borderRadius: 1.5,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              }
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
          </MenuItem>
        </Box>
        
        <Divider sx={{ my: 1.5, mx: 2 }} />
        
        <Box sx={{ pt: 0, pb: 2, px: 1 }}>
          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              py: 1.5,
              borderRadius: 1.5, 
              color: 'error.main',
              '&:hover': {
                bgcolor: theme.palette.error.light + '20',
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Cerrar sesión" />
          </MenuItem>
        </Box>
      </Menu>
      
      {/* Contenido principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          mt: { xs: '64px', md: 0 }
        }}
      >
        <Grid container spacing={3}>
          {/* KPIs */}
          <Grid item xs={12} md={4}>
            <KPICard
              title="Ventas del Mes"
              value={`$${stats.monthSales.toLocaleString()}`}
              change={((stats.monthSales - stats.previousMonthSales) / (stats.previousMonthSales || 1)) * 100}
              icon={<ShoppingCartIcon />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <KPICard
              title="Clientes Activos"
              value={stats.activeClients.toString()}
              badge={stats.newClientsToday > 0 ? 'Nuevos: ' + stats.newClientsToday : undefined}
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
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Ventas Recientes</Typography>
              <SalesChart />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Progreso de Meta</Typography>
              <GoalProgress />
            </Paper>
          </Grid>

          {/* Widgets */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Seguimiento de Clientes</Typography>
              <FollowupList />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Cumpleaños</Typography>
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
    </Box>
  );
}