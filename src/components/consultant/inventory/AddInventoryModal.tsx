'use client';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, FormControl, InputLabel, Select, Box
} from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  userId: string;
}

export function AddInventoryModal({ open, onClose, onAdded, userId }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [minStock, setMinStock] = useState(1);
  const [loading, setLoading] = useState(false);

  // Trae productos que NO están en el inventario de la consultora
  useEffect(() => {
    if (!open) return;
    const fetchProducts = async () => {
      try {
        // 1. Primero obtener el inventario actual de la consultora
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('product_id')
          .eq('user_id', userId);

        if (inventoryError) throw inventoryError;

        // 2. Crear array de IDs de productos ya en inventario
        const existingProductIds = inventoryData.map(item => item.product_id);

        // 3. Obtener productos que NO están en el inventario
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, sku')
          .eq('is_active', true)
          .not('id', 'in', `(${existingProductIds.join(',')})`);

        if (productsError) throw productsError;

        console.log('Productos disponibles:', productsData);
        setProducts(productsData || []);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, [open, userId]);

  const handleAdd = async () => {
    setLoading(true);
    const { error } = await supabase.from('inventory').insert({
      user_id: userId,
      product_id: productId,
      quantity,
      min_stock: minStock,
    });
    setLoading(false);
    if (!error) {
      onAdded();
      onClose();
      setProductId('');
      setQuantity(1);
      setMinStock(1);
    }
    // Maneja errores si quieres
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Agregar producto al inventario</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Producto</InputLabel>
            <Select
              value={productId}
              label="Producto"
              onChange={e => setProductId(e.target.value)}
            >
              {products.length === 0 ? (
                <MenuItem disabled>No hay productos disponibles</MenuItem>
              ) : (
                products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.sku} - {p.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
          <TextField
            label="Cantidad inicial"
            type="number"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            inputProps={{ min: 1 }}
            fullWidth
          />
          <TextField
            label="Stock mínimo (alerta)"
            type="number"
            value={minStock}
            onChange={e => setMinStock(Number(e.target.value))}
            inputProps={{ min: 1 }}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button
          onClick={handleAdd}
          disabled={!productId || quantity < 1 || minStock < 1 || loading}
          variant="contained"
        >
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  );
}