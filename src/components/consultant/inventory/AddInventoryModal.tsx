'use client';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, FormControl, InputLabel, Select, Box,
  Typography, CircularProgress, Alert, useTheme, IconButton, Chip,
  Divider, Grid
} from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import CloseIcon from '@mui/icons-material/Close';
import InventoryIcon from '@mui/icons-material/Inventory';

const BRAND_COLOR = '#FF90B3';

interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  userId: string;
}

export function AddInventoryModal({ open, onClose, onAdded, userId }: Props) {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [minStock, setMinStock] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState('');

  // Trae productos que NO están en el inventario de la consultora - VERSIÓN CORREGIDA
  useEffect(() => {
    if (!open || !userId) return;
    
    const fetchProducts = async () => {
      setLoadingProducts(true);
      setError('');
      
      try {
        // 1. Primero obtener el inventario actual de la consultora
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('product_id')
          .eq('user_id', userId);

        if (inventoryError) throw inventoryError;

        // 2. Crear array de IDs de productos ya en inventario
        const existingProductIds = inventoryData.map(item => item.product_id);
        
        // 3. Obtener productos NO en inventario (corrigiendo la consulta)
        let productsQuery = supabase
          .from('products')
          .select('id, name, sku, category')
          .eq('is_active', true);
        
        // Solo aplicar el filtro si hay productos en el inventario
        if (existingProductIds.length > 0) {
          // Hacemos una consulta diferente para evitar el error
          const { data: productsData, error: productsError } = await productsQuery;
          
          if (productsError) throw productsError;
          
          // Filtramos en JavaScript en lugar de en la consulta
          const availableProducts = productsData.filter(
            product => !existingProductIds.includes(product.id)
          );
          
          setProducts(availableProducts || []);
        } else {
          // Si no hay productos en inventario, traer todos
          const { data: allProducts, error: allProductsError } = await productsQuery;
          
          if (allProductsError) throw allProductsError;
          
          setProducts(allProducts || []);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setError(error.message || 'No se pudieron cargar los productos');
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [open, userId]);

  const handleAdd = async () => {
    if (!productId) {
      setError('Debes seleccionar un producto');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error: insertError } = await supabase
        .from('inventory')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
          min_stock: minStock,
        });
      
      if (insertError) throw insertError;
      
      onAdded();
      onClose();
      // Reset form
      setProductId('');
      setQuantity(1);
      setMinStock(1);
      
    } catch (error: any) {
      console.error('Error adding product:', error);
      setError(error.message || 'No se pudo agregar el producto al inventario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: BRAND_COLOR, 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pr: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon />
          <span>Agregar Producto al Inventario</span>
        </Box>
        <IconButton 
          size="small" 
          onClick={onClose}
          disabled={loading}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {loadingProducts ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={40} sx={{ color: BRAND_COLOR }} />
          </Box>
        ) : (
          products.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No hay productos disponibles para agregar a tu inventario. 
              Todos los productos activos ya están en tu inventario.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Producto</InputLabel>
                  <Select
                    value={productId}
                    label="Producto"
                    onChange={e => setProductId(e.target.value)}
                  >
                    {products.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2">{p.name}</Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              {p.sku}
                            </Typography>
                            {p.category && (
                              <Chip 
                                label={p.category} 
                                size="small" 
                                sx={{ 
                                  height: 20, 
                                  '& .MuiChip-label': { px: 1, fontSize: '0.7rem' } 
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cantidad inicial"
                  type="number"
                  value={quantity}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      setQuantity(val);
                    }
                  }}
                  inputProps={{ min: 0 }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Stock mínimo (alerta)"
                  type="number"
                  value={minStock}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 0) {
                      setMinStock(val);
                    }
                  }}
                  inputProps={{ min: 0 }}
                  fullWidth
                  helperText="Cantidad para mostrar alerta de stock bajo"
                />
              </Grid>
            </Grid>
          )
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)' }}>
        <Button 
          onClick={onClose}
          disabled={loading}
          sx={{
            color: theme.palette.text.secondary
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleAdd}
          disabled={!productId || loading || loadingProducts || products.length === 0}
          variant="contained"
          sx={{
            bgcolor: BRAND_COLOR,
            '&:hover': {
              bgcolor: '#e57a9e'
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Agregar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}