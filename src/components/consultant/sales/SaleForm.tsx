'use client'
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Box, Typography, 
  Autocomplete, Alert, CircularProgress, Divider,
  IconButton, Tooltip, useTheme, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

// Constantes
const BRAND_COLOR = '#FF90B3';
const ANIMATION_DURATION = 0.2;

// Tipos para props y estados
interface SaleFormProps {
  open: boolean;
  onClose: () => void;
  onSaleAdded: () => void;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Client {
  id: string;
  name: string;
  document: string;
  email?: string;
  phone?: string;
  birthday?: string;
}

interface SelectedProduct {
  product_id: string;
  quantity: number;
  price: number;
}

// Componentes reutilizables
interface ProductItemProps {
  product: SelectedProduct;
  index: number;
  products: Product[];
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: any) => void;
}

const ProductItem = ({ product, index, products, onRemove, onChange }: ProductItemProps) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: ANIMATION_DURATION }}
    layout
  >
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      mb: 2,
      p: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      background: (theme) => 
        theme.palette.mode === 'dark' 
          ? 'rgba(255,255,255,0.03)' 
          : 'rgba(255,255,255,0.5)',
      backdropFilter: 'blur(10px)',
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: BRAND_COLOR,
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(255,144,179,0.1)'
      }
    }}>
      <TextField
        select
        label="Producto"
        value={product.product_id}
        onChange={e => {
          const prod = products.find(prod => prod.id === e.target.value);
          onChange(index, 'product_id', e.target.value);
          onChange(index, 'price', prod ? prod.price : 0);
        }}
        sx={{ flex: 2 }}
        required
      >
        {products.map(prod => (
          <MenuItem 
            key={prod.id} 
            value={prod.id}
            disabled={prod.stock < 1}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Typography>{prod.name}</Typography>
              <Chip 
                size="small"
                label={`Stock: ${prod.stock}`}
                color={prod.stock < 5 ? 'warning' : 'default'}
              />
            </Box>
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Cantidad"
        type="number"
        value={product.quantity}
        onChange={e => {
          const newQuantity = Number(e.target.value);
          const currentProduct = products.find(prod => prod.id === product.product_id);
          if (currentProduct && newQuantity <= currentProduct.stock) {
            onChange(index, 'quantity', newQuantity);
          }
        }}
        sx={{ flex: 1 }}
        inputProps={{ 
          min: 1,
          max: products.find(prod => prod.id === product.product_id)?.stock || 1
        }}
        helperText={`Stock disponible: ${products.find(prod => prod.id === product.product_id)?.stock || 0}`}
      />
      <TextField
        label="Precio"
        type="number"
        value={product.price}
        onChange={e => onChange(index, 'price', Number(e.target.value))}
        sx={{ flex: 1 }}
        inputProps={{ min: 0 }}
      />
      <Tooltip title="Eliminar producto">
        <IconButton 
          color="error" 
          onClick={() => onRemove(index)}
          sx={{ alignSelf: 'center' }}
        >
          <RemoveCircleIcon />
        </IconButton>
      </Tooltip>
    </Box>
  </motion.div>
);

export function SaleForm({ open, onClose, onSaleAdded }: SaleFormProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [paymentType, setPaymentType] = useState('contado');
  const [firstPayment, setFirstPayment] = useState('');
  const [secondPayment, setSecondPayment] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [newClient, setNewClient] = useState({ document: '', name: '', email: '', phone: '', birthday: '' });

  // Cargar clientes y productos al abrir el modal
  useEffect(() => {
    if (!open || !userId) return;

    const fetchData = async () => {
      try {
        // 1. Obtener clientes
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, name, document, email, phone, birthday')
          .eq('consultant_id', userId);
        setClients(clientsData || []);

        // 2. Obtener productos del inventario de la consultora con join a products
        const { data: inventoryData, error } = await supabase
          .from('inventory')
          .select(`
            quantity,
            product:products (
              id,
              name,
              price
            )
          `)
          .eq('user_id', userId)
          .gt('quantity', 0) // Solo productos con stock disponible
          .eq('products.is_active', true);

        if (error) throw error;

        // 3. Formatear los productos para el select
        const availableProducts = inventoryData
          .filter(item => item.product) // Asegurarse que el producto existe
          .map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            stock: item.quantity
          }));

        setProducts(availableProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error cargando datos');
      }
    };

    fetchData();
    // Reset form
    setSelectedClient(null);
    setSelectedProducts([]);
    setPaymentType('contado');
    setFirstPayment('');
    setSecondPayment('');
    setAmount(0);
  }, [open, userId]);

  // Calcular total automáticamente
  useEffect(() => {
    const total = selectedProducts.reduce((acc, p) => acc + (p.quantity * p.price), 0);
    setAmount(total);
  }, [selectedProducts]);

  const handleProductChange = (index, field, value) => {
    const updated = [...selectedProducts];
    updated[index][field] = value;
    setSelectedProducts(updated);
  };

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { product_id: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveProduct = (index) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Verificar stock disponible
      for (const p of selectedProducts) {
        const { data: inventoryItem, error: inventoryError } = await supabase
          .from('inventory')
          .select('quantity')
          .eq('user_id', userId)
          .eq('product_id', p.product_id)
          .single();

        if (inventoryError) throw inventoryError;

        if (!inventoryItem || inventoryItem.quantity < p.quantity) {
          throw new Error(`Stock insuficiente para el producto ${
            products.find(prod => prod.id === p.product_id)?.name
          }`);
        }
      }

      // 2. Insertar venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          user_id: userId,
          client_id: selectedClient?.id,
          amount,
          payment_type: paymentType,
          payment_status: paymentType === 'contado' ? 'pagado' : 'pendiente',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (saleError) throw saleError;

      // 3. Insertar productos y actualizar inventario
      const saleProducts = selectedProducts.map(p => ({
        sale_id: sale.id,
        product_id: p.product_id,
        quantity: p.quantity,
        price_at_sale: p.price,
      }));

      const { error: saleProductsError } = await supabase
        .from('sale_products')
        .insert(saleProducts);
        
      if (saleProductsError) throw saleProductsError;

      // 4. Actualizar inventario
      for (const p of selectedProducts) {
        const { data: currentInventory } = await supabase
          .from('inventory')
          .select('quantity')
          .eq('user_id', userId)
          .eq('product_id', p.product_id)
          .single();

        if (currentInventory) {
          const newQuantity = currentInventory.quantity - p.quantity;
          const { error: updateError } = await supabase
            .from('inventory')
            .update({ quantity: newQuantity })
            .eq('user_id', userId)
            .eq('product_id', p.product_id);

          if (updateError) throw updateError;
        }
      }

      if (onSaleAdded) onSaleAdded();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al registrar la venta');
    }
    setLoading(false);
  };

  const handleCreateClient = async () => {
    const { data, error } = await supabase
      .from('clients')
      .insert([{ ...newClient, consultant_id: userId }])
      .select()
      .single();
    if (!error && data) {
      setClients([...clients, data]);
      setSelectedClient(data);
      setOpenClient(false);
      setNewClient({ document: '', name: '', email: '', phone: '', birthday: '' });
    } else {
      alert('Error creando cliente');
    }
  };

  // Memoizar cálculos pesados
  const memoizedProducts = useMemo(() => {
    return products.map(prod => ({
      ...prod,
      isLowStock: prod.stock < 5
    }));
  }, [products]);

  return (
    <AnimatePresence>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 },
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            background: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'linear-gradient(145deg, #1A1A1A 0%, #242424 100%)'
                : 'linear-gradient(145deg, #FFFFFF 0%, #F8F8F8 100%)',
            backdropFilter: 'blur(10px)',
            border: (theme) => `1px solid ${
              theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(0,0,0,0.1)'
            }`
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: `linear-gradient(135deg, ${BRAND_COLOR}, #FF80A3)`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2.5,
            '& .MuiSvgIcon-root': {
              fontSize: 24
            }
          }}
        >
          <ShoppingCartIcon />
          <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            Nueva Venta
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Espacio entre el título y el selector de cliente */}
          <Box sx={{ height: 16 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Autocomplete
              fullWidth
              options={clients}
              getOptionLabel={option => `${option.name} (${option.document})`}
              value={selectedClient}
              onChange={(_, value) => setSelectedClient(value)}
              renderInput={params => (
            <TextField 
              {...params} 
              label="Cliente" 
              required
              error={!selectedClient && selectedProducts.length > 0}
            />
              )}
            />
            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenClient(true)}
              sx={{
                borderColor: BRAND_COLOR,
                color: BRAND_COLOR,
                '&:hover': {
                  borderColor: BRAND_COLOR,
                  bgcolor: `${BRAND_COLOR}10`
                }
              }}
            >
              Nuevo
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon color="primary" />
            Productos
          </Typography>

          {selectedProducts.map((p, idx) => (
            <ProductItem 
              key={idx}
              product={p}
              index={idx}
              products={products}
              onRemove={() => handleRemoveProduct(idx)}
              onChange={handleProductChange}
            />
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            sx={{ 
              mt: 2,
              color: BRAND_COLOR,
              '&:hover': { bgcolor: `${BRAND_COLOR}10` }
            }}
          >
            Agregar Producto
          </Button>

          <Box sx={{ 
            mt: 3, 
            p: 2, 
            bgcolor: 'background.default',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle1" gutterBottom>
              Detalles de Pago
            </Typography>

            <TextField
              select
              label="Tipo de pago"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="contado">Contado</MenuItem>
              <MenuItem value="quincenal">Quincenal (2 pagos)</MenuItem>
              <MenuItem value="mensual">Mensual (1 pago)</MenuItem>
            </TextField>

            {paymentType !== 'contado' && (
              <Alert 
                severity="info" 
                variant="outlined"
                icon={false}
                sx={{ 
                  borderColor: BRAND_COLOR,
                  '& .MuiAlert-message': { color: 'text.primary' }
                }}
              >
                {paymentType === 'quincenal' 
                  ? 'Se registrará como venta a dos pagos quincenales' 
                  : 'Se registrará como venta a un pago mensual'}
              </Alert>
            )}

            <Typography 
              variant="h5" 
              sx={{ 
                mt: 2,
                textAlign: 'right',
                fontWeight: 600,
                color: BRAND_COLOR
              }}
            >
              Total: ${amount.toLocaleString()}
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            px: 3, 
            py: 2.5,
            background: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'rgba(0,0,0,0.2)' 
                : 'rgba(0,0,0,0.02)',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Button 
            onClick={onClose}
            variant="outlined"
            disabled={loading}
            sx={{
              borderColor: BRAND_COLOR,
              color: BRAND_COLOR,
              '&:hover': {
                borderColor: '#e57a9e',
                bgcolor: `${BRAND_COLOR}10`
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !selectedClient || selectedProducts.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{
              bgcolor: BRAND_COLOR,
              fontWeight: 600,
              px: 4,
              '&:hover': { 
                bgcolor: '#e57a9e',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(255,144,179,0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Procesando...' : 'Registrar Venta'}
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatePresence>
  );
}