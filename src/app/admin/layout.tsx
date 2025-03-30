'use client'
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import Link from 'next/link'; // Add this import
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const DRAWER_WIDTH = 240;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/login');
    }
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const menuItems = [
    { text: 'Resumen', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Consultoras', icon: <PeopleIcon />, path: '/admin/consultants' },
    { text: 'Promociones', icon: <LocalOfferIcon />, path: '/admin/promotions' },
    { text: 'Auditoría', icon: <AssessmentIcon />, path: '/admin/audit' },
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
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          background: theme.palette.mode === 'dark' 
            ? '#1A1A1A' 
            : '#F5F5F5',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}