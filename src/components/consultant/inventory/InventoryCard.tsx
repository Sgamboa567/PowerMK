'use client'
import { Box, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, useTheme, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import WarningIcon from '@mui/icons-material/Warning';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const BRAND_COLOR = '#FF90B3';

interface Product {
  id: string;
  name: string;
  stock: number;
  min_stock: number;
  total_sold?: number;
  image_url?: string;
}

export function InventoryCard() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [topSellers, setTopSellers] = useState<Product[]>([]);

  useEffect(() => {
    const fetchInventoryData = async () => {
      if (!session?.user?.id) return;

      try {
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select(`
            id,
            quantity,
            min_stock,
            product:products (
              id,
              name,
              image_url
            )
          `)
          .eq('user_id', session.user.id);

        if (inventoryError) throw inventoryError;

        // Procesar productos con bajo stock
        const lowStockItems = inventoryData
          .filter(item => item.quantity <= item.min_stock)
          .map(item => ({
            id: item.product.id,
            name: item.product.name,
            stock: item.quantity,
            min_stock: item.min_stock,
            image_url: item.product.image_url
          }))
          .slice(0, 5); // Mostrar solo los 5 más críticos

        setLowStock(lowStockItems);

        // Aquí podrías añadir la lógica para los más vendidos si lo necesitas
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        setError('No se pudo cargar la información del inventario');
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [session]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          bgcolor: theme.palette.error.main + '10',
          border: `1px solid ${theme.palette.error.main + '30'}`
        }}
      >
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark' 
          ? 'rgba(26,26,26,0.9)' 
          : 'rgba(255,255,255,0.9)',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(255,144,179,0.1)'
          : '1px solid rgba(255,144,179,0.2)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <WarningIcon sx={{ color: theme.palette.warning.main }} />
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          Inventario Crítico
        </Typography>
      </Box>

      {lowStock.length > 0 ? (
        <List>
          {lowStock.map((product) => (
            <ListItem
              key={product.id}
              sx={{
                borderRadius: 1,
                mb: 1,
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(255,144,179,0.05)'
                  : 'rgba(255,144,179,0.02)',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255,144,179,0.1)'
                    : 'rgba(255,144,179,0.05)',
                }
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={product.image_url}
                  sx={{
                    bgcolor: BRAND_COLOR + '20',
                    color: BRAND_COLOR
                  }}
                >
                  <LocalFireDepartmentIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={product.name}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={`Stock: ${product.stock}`}
                      size="small"
                      color="warning"
                      sx={{ 
                        '& .MuiChip-label': { fontWeight: 500 }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Mínimo: {product.min_stock}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No hay productos con stock crítico
          </Typography>
        </Box>
      )}
    </Paper>
  );
}