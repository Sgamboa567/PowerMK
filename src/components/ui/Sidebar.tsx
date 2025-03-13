import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  useTheme
} from '@mui/material';
import { 
  Dashboard,
  ShoppingCart,
  Inventory,
  People,
  CalendarMonth,
  Category
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Ventas', icon: <ShoppingCart />, path: '/dashboard/ventas' },
  { text: 'Catálogo', icon: <Category />, path: '/dashboard/catalogo' },
  { text: 'Clientes', icon: <People />, path: '/dashboard/clientes' },
  { text: 'Inventario', icon: <Inventory />, path: '/dashboard/inventario' },
  { text: 'Calendario', icon: <CalendarMonth />, path: '/dashboard/calendario' },
];

export default function Sidebar() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`
        },
      }}
    >
      <List sx={{ mt: 8 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            onClick={() => router.push(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}