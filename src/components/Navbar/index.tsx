'use client';

import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useThemeContext } from '@/components/providers/ThemeProvider';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const navItems = [
  { title: 'About', path: '/about' },
  { title: 'Contacto', path: '/contact' },
  { title: 'Catálogo', path: '/catalog' },
  { title: 'Promociones', path: '/promotions' },
  { title: 'Planes', path: '/plans' },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleTheme, isDarkMode } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: session } = useSession();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '95%',
        maxWidth: '1200px',
        zIndex: 1100,
      }}
    >
      <AppBar 
        position="relative" 
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', height: 64, px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Image
                  src="/logo.webp"
                  alt="PowerMK"
                  width={40}
                  height={40}
                  style={{
                    objectFit: 'contain',
                    filter: theme.palette.mode === 'dark' ? 'brightness(0) invert(1)' : 'none',
                    transition: 'filter 0.3s ease'
                  }}
                  priority
                />
              </Box>
            </Link>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {navItems.map((item) => (
                  <Button
                    key={item.title}
                    component={Link}
                    href={item.path}
                    sx={{ 
                      color: theme.palette.text.primary,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      px: 2,
                      borderRadius: '8px',
                      '&:hover': {
                        color: '#F5DADF',
                        backgroundColor: 'rgba(245,218,223,0.1)',
                      }
                    }}
                  >
                    {item.title}
                  </Button>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => {
                if (!session) {
                  router.push('/login');
                } else {
                  router.push('/cart');
                }
              }}
              sx={{ 
                color: theme.palette.text.primary,
                '&:hover': {
                  color: '#F5DADF',
                  backgroundColor: 'rgba(245,218,223,0.1)',
                }
              }}
            >
              <ShoppingCartIcon />
            </IconButton>

            <IconButton
              onClick={toggleTheme}
              sx={{ 
                color: theme.palette.text.primary,
                '&:hover': {
                  color: '#F5DADF',
                  backgroundColor: 'rgba(245,218,223,0.1)',
                }
              }}
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                sx={{ 
                  color: theme.palette.text.primary,
                  '&:hover': {
                    color: '#F5DADF',
                    backgroundColor: 'rgba(245,218,223,0.1)',
                  }
                }}
              >
                <MenuIcon />
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
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)',
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
                color: theme.palette.text.primary,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(245,218,223,0.1)',
                }
              }}
            >
              <ListItemText 
                primary={item.title}
                primaryTypographyProps={{
                  sx: { fontSize: '0.875rem' }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
};