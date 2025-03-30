'use client'
import { InventoryTable } from '@/components/consultant/InventoryTable';
import { Box, Typography } from '@mui/material';

export default function InventoryPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mi Inventario
      </Typography>
      <InventoryTable />
    </Box>
  );
}