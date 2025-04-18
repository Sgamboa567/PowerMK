'use client';

import { Box } from '@mui/material';
import { HeroBanner } from '@/components/HeroBanner';
import { Footer } from '@/components/Footer';
import { useTheme } from '@mui/material/styles';

export default function Home() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <HeroBanner />
      <Footer />
    </Box>
  );
}