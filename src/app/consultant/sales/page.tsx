'use client'
import { useState } from 'react';
import { SalesTable } from '@/components/consultant/sales/SalesTable';
import { SaleForm } from '@/components/consultant/sales/SaleForm';
import { 
  Box, 
  Typography, 
  Button, 
  useTheme, 
  Paper,
  Container,
  useMediaQuery 
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import AddIcon from '@mui/icons-material/Add';

const BRAND_COLOR = '#FF90B3';

export default function SalesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const handleSaleAdded = () => {
    setOpen(false);
    setRefresh(r => r + 1);
  };

  return (
    <Container maxWidth="xl">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          minHeight: '100vh',
          py: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Header con animación y diseño mejorado */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(255,144,179,0.1), transparent)'
              : 'linear-gradient(135deg, rgba(255,144,179,0.05), transparent)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              component={motion.h4}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              sx={{
                fontWeight: 600,
                color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
                mb: 1
              }}
            >
              Registro de Ventas
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              component={motion.p}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Gestiona y monitorea tus ventas de manera eficiente
            </Typography>
          </Box>

          <Button
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{
              bgcolor: BRAND_COLOR,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(255,144,179,0.2)',
              '&:hover': {
                bgcolor: '#e57a9e',
                boxShadow: '0 6px 16px rgba(255,144,179,0.3)',
              }
            }}
            startIcon={<AddIcon />}
          >
            {isMobile ? 'Nueva' : 'Nueva Venta'}
          </Button>
        </Paper>

        {/* Tabla de ventas con animación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <SalesTable userId={session?.user?.id} key={refresh} />
        </motion.div>

        {/* Modal de nueva venta */}
        <SaleForm
          open={open}
          onClose={() => setOpen(false)}
          onSaleAdded={handleSaleAdded}
          userId={session?.user?.id}
        />
      </Box>
    </Container>
  );
}