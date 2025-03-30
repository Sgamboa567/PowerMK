'use client'
import { ClientsTable } from '@/components/consultant/ClientsTable';
import { Box, Typography } from '@mui/material';

export default function ClientsPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mis Clientes
      </Typography>
      <ClientsTable />
    </Box>
  );
}