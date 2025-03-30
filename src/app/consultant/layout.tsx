'use client'
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import Link from 'next/link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DRAWER_WIDTH = 240;

export default function ConsultantLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'consultant') {
      router.push('/login');
    }
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router]);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/consultant' },
    { text: 'Ventas', icon: <ShoppingCartIcon />, path: '/consultant/sales' },
    { text: 'Clientes', icon: <PeopleIcon />, path: '/consultant/clients' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/consultant/inventory' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: theme.palette.mode === 'dark' ? '#1A1A1A' : '#fff',
            borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(245,218,223,0.1)' : 'rgba(245,218,223,0.3)'}`,
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem button key={item.text} component={Link} href={item.path}>
              <ListItemIcon sx={{ color: '#F5DADF' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}