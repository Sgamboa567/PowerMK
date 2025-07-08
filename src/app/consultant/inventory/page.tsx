'use client'
import { useState } from 'react';
import { InventoryTable } from '@/components/consultant/inventory/InventoryTable';
import { 
  Box, 
  Typography, 
  Paper,
  Container,
  useTheme,
  Button,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useSession } from 'next-auth/react';

const BRAND_COLOR = '#FF90B3';

export default function InventoryPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { data: session } = useSession();
  const [addOpen, setAddOpen] = useState(false);

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
        {/* Header con diseño mejorado */}
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
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 600,
                color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
                mb: 1
              }}
            >
              <InventoryIcon sx={{ color: BRAND_COLOR }} />
              Mi Inventario
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              component={motion.p}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Gestiona tu stock y productos Mary Kay
            </Typography>
          </Box>

          <Button
            component={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            variant="contained"
            onClick={() => setAddOpen(true)}
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
            {isMobile ? 'Agregar' : 'Agregar Producto'}
          </Button>
        </Paper>

        {/* Tabla de inventario con animación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <InventoryTable 
            userId={session?.user?.id} 
            addOpen={addOpen} 
            setAddOpen={setAddOpen} 
          />
        </motion.div>
      </Box>
    </Container>
  );
}