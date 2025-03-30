'use client'
import { SalesTable } from '@/components/consultant/SalesTable';
import { Box, Typography } from '@mui/material';

export default function SalesPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Registro de Ventas
      </Typography>
      <SalesTable />
    </Box>
  );
}