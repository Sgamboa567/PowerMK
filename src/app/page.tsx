'use client';

import { Box } from '@mui/material';
import { HeroBanner } from '@/components/HeroBanner';
import { Footer } from '@/components/Footer';
import { useTheme } from '@mui/material/styles';

// Remove the metadata export from this client component
export default function HomePage() {
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