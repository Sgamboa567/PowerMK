'use client'
import { Box, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, useTheme, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
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
            product_id,
            products!inner(id, name, image_url)
          `)
          .eq('user_id', session.user.id);

        if (inventoryError) throw inventoryError;

        // Procesar productos con bajo stock
        const lowStockItems = inventoryData
          .filter(item => item.quantity <= item.min_stock)
          .map(item => {
            // Determinar si products es un array o un objeto
            const productData = Array.isArray(item.products) 
              ? item.products[0]  // Usar el primer producto si es array
              : item.products;    // Usar directamente si es objeto
              
            return {
              id: productData?.id || item.product_id, // Fallback al ID del producto
              name: productData?.name || 'Producto sin nombre',
              stock: item.quantity,
              min_stock: item.min_stock,
              image_url: productData?.image_url
            };
          })
          .slice(0, 5); // Mostrar solo los 5 más críticos

        setLowStock(lowStockItems);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}>
        <CircularProgress size={30} sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" variant="body2" sx={{ py: 2 }}>
        {error}
      </Typography>
    );
  }

  return (
    <>
      {lowStock.length > 0 ? (
        <List disablePadding>
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
                secondaryTypographyProps={{ component: 'div' }}
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
    </>
  );
}