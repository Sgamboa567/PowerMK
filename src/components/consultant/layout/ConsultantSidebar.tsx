'use client'
import { motion } from 'framer-motion';
import {
  Box,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,         
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Collapse,
  Tooltip   
} from '@mui/material';
import {
  AccountCircle,
  CalendarMonth,
  Dashboard,
  DarkMode,
  ExpandLess,
  ExpandMore,
  Inventory,
  LightMode,
  Logout,
  Menu as MenuIcon,
  People,
  Settings,
  ShoppingCart,
} from '@mui/icons-material';
import { useCallback, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useThemeContext } from '@/components/providers/ThemeProvider';

const BRAND_COLOR = '#FF90B3';
const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/consultant' },
  { text: 'Ventas', icon: <ShoppingCart />, path: '/consultant/sales' },
  { text: 'Clientes', icon: <People />, path: '/consultant/clients' },
  { text: 'Inventario', icon: <Inventory />, path: '/consultant/inventory' },
  { text: 'Calendario', icon: <CalendarMonth />, path: '/consultant/calendar' },
];

interface DrawerContentProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function ConsultantSidebar() {
  const theme = useTheme();
  const { toggleTheme, isDarkMode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [openConfig, setOpenConfig] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = (path: string) => {
    router.push(path);
    if (isMobile) setDrawerOpen(false);
  };

  const handleProfile = () => {
    router.push('/consultant/account');
    if (isMobile) setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
    if (isMobile) setDrawerOpen(false);
  };

  const DrawerContent = useCallback(
    ({ onClose, isMobile }: DrawerContentProps) => {
      return (
        <Box sx={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Perfil Header */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(255,144,179,0.1), transparent)'
                  : 'linear-gradient(135deg, rgba(255,144,179,0.05), transparent)',
            }}
          >
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring' }}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  mb: 2,
                  bgcolor: BRAND_COLOR,
                  border: '3px solid white',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                }}
                src={session?.user?.image || undefined}
                alt={session?.user?.name || 'Consultora'}
              >
                {session?.user?.name?.charAt(0) || 'C'}
              </Avatar>
            </motion.div>

            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {session?.user?.name || 'Consultora'}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
                letterSpacing: 0.5,
              }}
            >
              Consultora Mary Kay
            </Typography>
          </Box>

          <Divider sx={{ opacity: 0.6 }} />

          {/* Menú principal */}
          <List sx={{ px: 2, py: 1, flexGrow: 1 }}>
            {menuItems.map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem
                  button
                  selected={pathname === item.path}
                  onClick={() => {
                    router.push(item.path);
                    onClose?.();
                  }}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor:
                      pathname === item.path ? `${BRAND_COLOR}20` : 'transparent',
                    '&:hover': {
                      bgcolor: `${BRAND_COLOR}15`,
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: BRAND_COLOR, minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              </motion.div>
            ))}
          </List>

          <Divider sx={{ opacity: 0.6 }} />

          {/* Configuración y Tema */}
          <List sx={{ px: 2, py: 1 }}>
            <ListItem
              button
              onClick={() => setOpenConfig(prev => !prev)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: BRAND_COLOR, minWidth: 40 }}>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Configuración" />
              {openConfig ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            <Collapse in={openConfig} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem
                  button
                  onClick={handleProfile}
                  sx={{ pl: 4, borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ color: BRAND_COLOR, minWidth: 40 }}>
                    <AccountCircle />
                  </ListItemIcon>
                  <ListItemText primary="Mi Cuenta" />
                </ListItem>

                <ListItem
                  button
                  onClick={toggleTheme}
                  sx={{ pl: 4, borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ color: BRAND_COLOR, minWidth: 40 }}>
                    {isDarkMode ? <LightMode /> : <DarkMode />}
                  </ListItemIcon>
                  <ListItemText primary={isDarkMode ? "Modo Claro" : "Modo Oscuro"} />
                </ListItem>
              </List>
            </Collapse>

            {/* Cerrar Sesión */}
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                mt: 1,
                color: theme.palette.error.main,
                '&:hover': {
                  bgcolor: theme.palette.error.light + '15',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Cerrar Sesión" />
            </ListItem>
          </List>
        </Box>
      );
    },
    [theme.palette.mode, pathname, session, openConfig]
  );

  // Responsive Drawer
  return (
    <>
      {isMobile ? (
        <>
          <Tooltip title="Abrir menú" arrow>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{
                position: 'fixed',
                top: 16,
                left: 16,
                zIndex: 2000,
                bgcolor: '#FF90B3',
                color: '#fff',
                boxShadow: 2,
                '&:hover': { bgcolor: '#e57a9e' },
              }}
              aria-label="Abrir menú de navegación"
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                background: theme.palette.mode === 'dark' ? '#1A1A1A' : '#fff',
              },
            }}
            aria-label="Menú lateral"
          >
            {DrawerContent({ onClose: () => setDrawerOpen(false), isMobile })}
          </Drawer>
        </>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              background: theme.palette.mode === 'dark' ? '#1A1A1A' : '#fff',
            },
          }}
          aria-label="Menú lateral"
        >
          {DrawerContent({ isMobile: false })}
        </Drawer>
      )}
    </>
  );
}