'use client'

import { Box } from '@mui/material';
import { HeroBanner } from '@/components/HeroBanner';
import { useTheme } from '@mui/material/styles';

export default function Home() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(245,218,223,0.05) 0%, rgba(26,26,26,1) 100%)'
          : 'linear-gradient(135deg, rgba(245,218,223,0.2) 0%, rgba(255,255,255,1) 100%)',
        position: 'relative'
      }}
    >
      <HeroBanner />
    </Box>
  );
}