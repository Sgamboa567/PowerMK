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
} from '@mui/material';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useThemeContext } from '@/components/providers/ThemeProvider';

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

const navItems = [
  { title: 'About', path: '/about', icon: <InfoIcon /> },
  { title: 'Contacto', path: '/contact', icon: <ContactsIcon /> },
  { title: 'Catálogo', path: '/catalog', icon: <CategoryIcon /> },
  { title: 'Promociones', path: '/promotions', icon: <LocalOfferIcon /> },
];

// Update the Navbar component to check if we're in the consultant/admin dashboard area
export const Navbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleTheme, isDarkMode } = useThemeContext();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  // Add the missing handleDrawerToggle function
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await signOut({ callbackUrl: '/' });
  };

  // Actualiza la función para redirigir correctamente según el rol
  const handleDashboardClick = () => {
    handleMenuClose();
    
    if (!session?.user?.role) {
      console.error("No se encontró rol en la sesión del usuario");
      return;
    }
    
    // Redirigir según el rol del usuario
    const role = session.user.role.toLowerCase();
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'consultant' || role === 'director') {
      router.push('/consultant');
    } else {
      // Si es otro tipo de usuario, redirigir a una página genérica
      router.push('/dashboard');
    }
  };

  // Check if current path should hide navbar
  const isHiddenNavbarPath = 
    (pathname.startsWith('/consultant') || pathname.startsWith('/admin')) &&
    pathname !== '/';

  // Don't render navbar on consultant or admin dashboard pages
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
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(26, 26, 26, 0.6)' 
            : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: { xs: 0, md: '16px' },
          border: `1px solid ${
            theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'
          }`,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  '&:hover': { opacity: 0.8 },
                  transition: 'opacity 0.2s',
                }}
              >
                <Image
                  src="/logo.webp"
                  alt="PowerMK"
                  width={32}
                  height={32}
                  priority
                  style={{
                    objectFit: 'contain',
                    filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none',
                    transition: 'filter 0.3s ease',
                  }}
                  unoptimized
                />
              </Box>
            </Link>

            {/* Always show navigation items */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Divider orientation="vertical" sx={{ height: 24, mx: 2 }} />
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.title}
                    component={Link}
                    href={item.path}
                    startIcon={item.icon}
                    sx={{ 
                      color: theme.palette.text.primary,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      px: 2,
                      py: 0.75,
                      borderRadius: '8px',
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(0,0,0,0.05)',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: 18,
                      }
                    }}
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            </Box>

            {/* User session info */}
            {session && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ 
                    mr: 2,
                    color: theme.palette.text.primary,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Bienvenida, {session.user?.name}
                </Typography>
                <IconButton
                  onClick={handleMenuClick}
                  sx={{
                    color: theme.palette.text.primary,
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.05)',
                    },
                  }}
                >
                  {session.user?.image ? (
                    <Avatar 
                      src={session.user.image} 
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <AccountCircleIcon />
                  )}
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(26,26,26,0.95)'
                        : 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  {/* Información del usuario */}
                  <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {session?.user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {session?.user?.email}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      display: 'inline-block',
                      mt: 0.5,
                      px: 1,
                      py: 0.25,
                      bgcolor: '#FF90B3',
                      color: 'white',
                      borderRadius: 1,
                      fontWeight: 'bold'
                    }}>
                      {session?.user?.role === 'admin' ? 'Administrador' : 
                       session?.user?.role === 'consultant' ? 'Consultora' : 
                       session?.user?.role === 'director' ? 'Directora' : 'Usuario'}
                    </Typography>
                  </Box>
                  
                  {/* Opciones del menú */}
                  <MenuItem onClick={handleDashboardClick}>
                    <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                    Mi Dashboard
                  </MenuItem>
                  
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                    Cerrar sesión
                  </MenuItem>
                </Menu>
              </Box>
            )}
          </Box>

          {/* Theme toggle and other controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => {
                if (!session) {
                  router.push('/login');
                } else {
                  // Si está autenticado, verificar el rol para redirigir adecuadamente
                  const role = session.user?.role?.toLowerCase();
                  if (role === 'admin') {
                    router.push('/admin');
                  } else if (role === 'consultant' || role === 'director') {
                    router.push('/consultant/sales'); // O la ruta específica para ventas/carrito
                  } else {
                    router.push('/cart');
                  }
                }
              }}
              sx={{ 
                color: theme.palette.text.primary,
                p: 1,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                }
              }}
            >
              <ShoppingCartIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => toggleTheme()} // Eliminado el evento como parámetro
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              sx={{ 
                color: theme.palette.text.primary,
                p: 1,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                  color: '#F5DADF',
                }
              }}
            >
              {isDarkMode ? 
                <Brightness7Icon sx={{ fontSize: 20 }} /> : 
                <Brightness4Icon sx={{ fontSize: 20 }} />
              }
            </IconButton>

            {isMobile && (
              <IconButton
                size="small"
                onClick={handleDrawerToggle}
                sx={{ 
                  color: theme.palette.text.primary,
                  p: 1,
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                <MenuIcon sx={{ fontSize: 20 }} />
              </IconButton>
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
            backdropFilter: 'blur(10px)',
            width: 250,
          }
        }}
      >
        <List sx={{ pt: 2 }}>
          {navItems.map((item) => (
            <ListItem 
              button 
              key={item.title}
              component={Link}
              href={item.path}
              onClick={handleDrawerToggle}
              sx={{
                py: 1,
                px: 2,
                color: theme.palette.text.primary,
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 36,
                color: 'inherit',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  sx: { 
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};