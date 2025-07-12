'use client';

import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Divider,
  Badge,
  Tooltip,
  Chip
} from '@mui/material';
import { useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { useThemeContext } from '@/components/providers/ThemeProvider';
import { motion } from 'framer-motion';

// Iconos
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoIcon from '@mui/icons-material/Info';
import ContactsIcon from '@mui/icons-material/Contacts';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Constantes
const BRAND_COLOR = '#FF90B3';
const GOLD_COLOR = '#c59d5f';

// Elementos de navegación centralizados para fácil mantenimiento
const navItems = [
  { title: 'Sobre Nosotros', path: '/about', icon: <InfoIcon /> },
  { title: 'Contacto', path: '/contact', icon: <ContactsIcon /> },
  { title: 'Catálogo', path: '/catalog', icon: <CategoryIcon /> },
  { title: 'Promociones', path: '/promotions', icon: <LocalOfferIcon /> },
];

export const Navbar = () => {
  // Hooks y estados
  const { data: session } = useSession();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleTheme, isDarkMode } = useThemeContext();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  
  // Handlers optimizados con useCallback
  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(async () => {
    handleMenuClose();
    await signOut({ callbackUrl: '/' });
  }, [handleMenuClose]);

  const handleDashboardClick = useCallback(() => {
    handleMenuClose();
    
    if (!session?.user?.role) {
      return;
    }
    
    const role = session.user.role.toLowerCase();
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'consultant' || role === 'director') {
      router.push('/consultant');
    } else {
      router.push('/dashboard');
    }
  }, [handleMenuClose, router, session?.user?.role]);

  // No renderizar la navbar en las páginas de dashboard
  const isHiddenNavbarPath = (pathname.startsWith('/consultant') || pathname.startsWith('/admin')) && pathname !== '/';
  if (isHiddenNavbarPath) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 0, md: 16 },
        left: '50%',
        transform: 'translateX(-50%)',
        width: { xs: '100%', md: '95%' },
        maxWidth: '1200px',
        zIndex: 1100,
      }}
    >
      <AppBar 
        position="relative" 
        elevation={0}
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(26, 26, 26, 0.7)' 
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: { xs: 0, md: '16px' },
          border: `1px solid ${
            theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.05)'
          }`,
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.2)'
            : '0 8px 32px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundImage: `url("data:image/png;base64,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")`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none',
                    transition: 'filter 0.3s ease',
                  }}
                  />
                  <Typography 
                    variant="h6" 
                    component="span"
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.mode === 'dark' ? 'white' : 'black',
                      display: { xs: 'none', sm: 'block' },
                      letterSpacing: 0.5,
                      fontSize: '1.25rem'
                    }}
                  >
                    Power<span style={{ color: BRAND_COLOR }}>MK</span>
                  </Typography>
                </Box>
              </Link>
            </motion.div>

            {/* Navegación */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Divider orientation="vertical" sx={{ height: 28, mx: 2, opacity: 0.6 }} />
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.title}
                    component={Link}
                    href={item.path}
                    startIcon={item.icon}
                    sx={{ 
                      color: pathname === item.path
                        ? BRAND_COLOR
                        : theme.palette.text.primary,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      fontWeight: pathname === item.path ? 600 : 500,
                      '&::after': pathname === item.path ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 6,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '40%',
                        height: 2,
                        bgcolor: BRAND_COLOR,
                        borderRadius: '2px'
                      } : {},
                      '&:hover': {
                        bgcolor: alpha(BRAND_COLOR, 0.08),
                        '& .MuiSvgIcon-root': {
                          transform: 'translateY(-2px)',
                          color: BRAND_COLOR
                        }
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: 18,
                        color: pathname === item.path ? BRAND_COLOR : 'inherit',
                        transition: 'transform 0.3s ease, color 0.3s ease',
                      }
                    }}
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* Información del usuario */}
            {session && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ 
                    mr: 2,
                    color: theme.palette.text.primary,
                    display: { xs: 'none', sm: 'block' },
                    fontWeight: 500
                  }}
                >
                  Bienvenida, <span style={{ fontWeight: 600, color: BRAND_COLOR }}>{session.user?.name?.split(' ')[0]}</span>
                </Typography>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <IconButton
                    onClick={handleMenuClick}
                    sx={{
                      color: theme.palette.text.primary,
                      '&:hover': {
                        bgcolor: alpha(BRAND_COLOR, 0.1),
                      },
                    }}
                  >
                    {session.user?.image ? (
                      <Avatar 
                        src={session.user.image} 
                        sx={{ 
                          width: 36, 
                          height: 36,
                          border: `2px solid ${BRAND_COLOR}`,
                          boxShadow: `0 0 0 2px ${alpha(BRAND_COLOR, 0.3)}`
                        }}
                      />
                    ) : (
                      <Avatar 
                        sx={{ 
                          width: 36, 
                          height: 36,
                          bgcolor: BRAND_COLOR,
                          color: 'white'
                        }}
                      >
                        {session.user?.name?.charAt(0) || 'U'}
                      </Avatar>
                    )}
                  </IconButton>
                </motion.div>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      minWidth: 220,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(26,26,26,0.95)'
                        : 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: 2,
                      boxShadow: theme.shadows[4],
                      overflow: 'visible',
                      '&:before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(26,26,26,0.95)'
                          : 'rgba(255,255,255,0.95)',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      }
                    }
                  }}
                >
                  <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {session?.user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {session?.user?.email}
                    </Typography>
                    <Chip
                      label={
                        session?.user?.role === 'admin' ? 'Administrador' : 
                        session?.user?.role === 'consultant' ? 'Consultora' : 
                        session?.user?.role === 'director' ? 'Directora' : 'Usuario'
                      }
                      size="small"
                      sx={{ 
                        bgcolor: BRAND_COLOR,
                        color: 'white',
                        fontWeight: 'bold',
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </Box>
                  
                  <MenuItem 
                    onClick={handleDashboardClick}
                    sx={{ 
                      py: 1.5,
                      '&:hover': { bgcolor: alpha(BRAND_COLOR, 0.1) }
                    }}
                  >
                    <ListItemIcon sx={{ color: BRAND_COLOR, minWidth: 36 }}>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Mi Dashboard" 
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>
                  
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1.5, 
                      color: theme.palette.error.main,
                      '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                    }}
                  >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Cerrar sesión"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>

          {/* Acciones rápidas */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Carrito de compras">
              <IconButton
                size="small"
                onClick={() => {
                  if (!session) {
                    router.push('/login');
                  } else {
                    const role = session.user?.role?.toLowerCase();
                    if (role === 'admin') {
                      router.push('/admin');
                    } else if (role === 'consultant' || role === 'director') {
                      router.push('/consultant/sales');
                    } else {
                      router.push('/cart');
                    }
                  }
                }}
                sx={{ 
                  color: theme.palette.text.primary,
                  p: 1.2,
                  borderRadius: 1.5,
                  '&:hover': {
                    bgcolor: alpha(BRAND_COLOR, 0.1),
                    color: BRAND_COLOR
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Badge badgeContent={0} color="primary">
                  <ShoppingCartIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={isDarkMode ? "Modo claro" : "Modo oscuro"}>
              <IconButton
                size="small"
                onClick={toggleTheme}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                sx={{ 
                  color: theme.palette.text.primary,
                  p: 1.2,
                  borderRadius: 1.5,
                  '&:hover': {
                    bgcolor: alpha(BRAND_COLOR, 0.1),
                    color: BRAND_COLOR
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {isDarkMode ? 
                  <Brightness7Icon sx={{ fontSize: 22 }} /> : 
                  <Brightness4Icon sx={{ fontSize: 22 }} />
                }
              </IconButton>
            </Tooltip>

            {isMobile && (
              <Tooltip title="Menú">
                <IconButton
                  size="small"
                  onClick={handleDrawerToggle}
                  sx={{ 
                    color: theme.palette.text.primary,
                    p: 1.2,
                    borderRadius: 1.5,
                    '&:hover': {
                      bgcolor: alpha(BRAND_COLOR, 0.1),
                      color: BRAND_COLOR
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <MenuIcon sx={{ fontSize: 22 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(26,26,26,0.95)' 
              : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            width: 280,
            borderLeft: theme.palette.mode === 'dark'
              ? '1px solid rgba(255,255,255,0.1)'
              : '1px solid rgba(0,0,0,0.05)',
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                backgroundImage: `url("data:image/png;base64,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")`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none',
                transition: 'filter 0.3s ease',
              }}
            />
            <Typography variant="h6" fontWeight={600}>
              Power<span style={{ color: BRAND_COLOR }}>MK</span>
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle} size="small">
            <MenuIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ opacity: 0.6 }} />
        
        <Box sx={{ p: 2 }}>
          {session ? (
            <Box sx={{ 
              mb: 2, 
              p: 2, 
              borderRadius: 2, 
              bgcolor: alpha(BRAND_COLOR, 0.1),
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              {session.user?.image ? (
                <Avatar 
                  src={session.user.image} 
                  sx={{ 
                    width: 42, 
                    height: 42,
                    border: `2px solid ${BRAND_COLOR}`
                  }}
                />
              ) : (
                <Avatar 
                  sx={{ 
                    width: 42, 
                    height: 42,
                    bgcolor: BRAND_COLOR
                  }}
                >
                  {session.user?.name?.charAt(0) || 'U'}
                </Avatar>
              )}
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {session.user?.name}
                </Typography>
                <Chip
                  label={
                    session.user?.role === 'admin' ? 'Administrador' : 
                    session.user?.role === 'consultant' ? 'Consultora' : 
                    session.user?.role === 'director' ? 'Directora' : 'Usuario'
                  }
                  size="small"
                  sx={{ 
                    bgcolor: BRAND_COLOR,
                    color: 'white',
                    fontSize: '0.65rem',
                    height: 20,
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Button 
              variant="contained"
              fullWidth
              onClick={() => router.push('/login')}
              sx={{ 
                mb: 2, 
                bgcolor: BRAND_COLOR,
                '&:hover': { bgcolor: alpha(BRAND_COLOR, 0.8) }
              }}
            >
              Iniciar sesión
            </Button>
          )}
        </Box>
        
        <List sx={{ pt: 0 }}>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.title}
              component={Link}
              href={item.path}
              onClick={handleDrawerToggle}
              sx={{
                py: 1.5,
                px: 2,
                color: pathname === item.path ? BRAND_COLOR : theme.palette.text.primary,
                bgcolor: pathname === item.path ? alpha(BRAND_COLOR, 0.1) : 'transparent',
                fontWeight: pathname === item.path ? 600 : 'normal',
                '&:hover': {
                  bgcolor: alpha(BRAND_COLOR, 0.08),
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: pathname === item.path ? BRAND_COLOR : 'inherit',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  sx: { 
                    fontWeight: pathname === item.path ? 600 : 500,
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2, opacity: 0.6 }} />
        
        {session && (
          <Box sx={{ px: 2, pb: 3 }}>
            <Button 
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<DashboardIcon />}
              onClick={handleDashboardClick}
              sx={{
                mb: 2,
                borderColor: BRAND_COLOR,
                color: BRAND_COLOR,
                '&:hover': {
                  bgcolor: alpha(BRAND_COLOR, 0.1),
                  borderColor: BRAND_COLOR
                }
              }}
            >
              Mi Dashboard
            </Button>
            
            <Button 
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};