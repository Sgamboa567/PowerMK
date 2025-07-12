'use client'
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Box, Typography, 
  Autocomplete, Alert, CircularProgress, Divider,
  IconButton, Tooltip, useTheme, Chip, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { alpha } from '@mui/material/styles';

// Constantes
const BRAND_COLOR = '#FF90B3';
const ANIMATION_DURATION = 0.2;

// Componente para crear cliente nuevo con TypeScript mejorado
interface NewClientFormProps {
  open: boolean;
  onClose: () => void;
  onClientCreated: (clientData: any) => Promise<boolean>;
}

interface ClientFormData {
  document: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
}

const NewClientForm = ({ open, onClose, onClientCreated }: NewClientFormProps) => {
  const theme = useTheme();
  const [formData, setFormData] = useState<ClientFormData>({
    document: '',
    name: '',
    email: '',
    phone: '',
    birthday: ''
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.document) return;
    
    setLoading(true);
    try {
      const result = await onClientCreated(formData);
      if (result) {
        onClose();
        // Resetear el formulario
        setFormData({
          document: '',
          name: '',
          email: '',
          phone: '',
          birthday: ''
        });
      }
    } catch (error) {
      console.error('Error al crear cliente:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, #1A1A1A 0%, #242424 100%)'
            : 'linear-gradient(145deg, #FFFFFF 0%, #F8F8F8 100%)'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon sx={{ color: BRAND_COLOR }} />
          <span style={{ fontWeight: 500, fontSize: '1.25rem' }}>Nuevo Cliente</span>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre completo"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Documento"
                required
                name="document"
                value={formData.document}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de nacimiento"
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
            sx={{
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary
            }}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={!formData.name || !formData.document || loading}
            sx={{ 
              bgcolor: BRAND_COLOR,
              '&:hover': {
                bgcolor: '#e57a9e'
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

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
  sku?: string;
  category?: string;
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
  loading?: boolean;
}

// Componente ProductItem mejorado - VERSIÓN ESTABLE FINAL
const ProductItem = ({ product, index, products, onRemove, onChange, loading = false }: ProductItemProps) => {
  const theme = useTheme();
  
  // Memoizar el producto actual
  const currentProduct = useMemo(() => {
    return products.find(p => p.id === product.product_id) || null;
  }, [product.product_id, products]);
  
  // Función para manejar cambios de producto
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const productId = e.target.value;
    
    // Actualizar el ID del producto
    onChange(index, 'product_id', productId);
    
    // Encontrar el producto seleccionado
    const selectedProduct = products.find(p => p.id === productId);
    
    // Actualizar precio y resetear cantidad
    if (selectedProduct) {
      onChange(index, 'price', selectedProduct.price);
      onChange(index, 'quantity', 1);
    }
  };
  
  // Función para manejar cambios de cantidad
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newQuantity = parseInt(value);
    
    if (!isNaN(newQuantity) && newQuantity > 0) {
      // Si hay un producto seleccionado, validar contra stock disponible
      if (currentProduct) {
        const maxStock = currentProduct.stock;
        // Asegurar que la cantidad esté entre 1 y el stock máximo
        const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));
        onChange(index, 'quantity', validQuantity);
      } else {
        onChange(index, 'quantity', newQuantity);
      }
    }
  };
  
  // Función para manejar cambios de precio
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newPrice = parseFloat(value);
    
    if (!isNaN(newPrice) && newPrice >= 0) {
      onChange(index, 'price', newPrice);
    }
  };
  
  // Actualizar precio si es necesario
  useEffect(() => {
    if (currentProduct && product.price === 0) {
      onChange(index, 'price', currentProduct.price);
    }
  }, [currentProduct, index, onChange, product.price]);
  
  return (
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
        borderColor: currentProduct ? alpha(BRAND_COLOR, 0.4) : 'divider',
        background: (theme) => 
          theme.palette.mode === 'dark' 
            ? currentProduct ? alpha(BRAND_COLOR, 0.07) : 'rgba(255,255,255,0.03)'
            : currentProduct ? alpha(BRAND_COLOR, 0.03) : 'rgba(255,255,255,0.5)',
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
          onChange={handleProductChange}
          sx={{ flex: 2 }}
          disabled={loading}
          required
        >
          <MenuItem value="" disabled>Seleccionar producto</MenuItem>
          {products.map(p => (
            <MenuItem 
              key={p.id} 
              value={p.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body1">{p.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Stock: {p.stock} {p.sku && `· SKU: ${p.sku}`}
                </Typography>
              </Box>
              <Chip 
                size="small" 
                label={`$${p.price.toLocaleString()}`}
                color="primary" 
                variant="outlined"
                sx={{ ml: 'auto' }}
              />
            </MenuItem>
          ))}
        </TextField>
        
        <TextField
          label="Cantidad"
          type="number"
          value={product.quantity}
          onChange={handleQuantityChange}
          sx={{ flex: 1 }}
          inputProps={{ 
            min: 1,
            max: currentProduct?.stock || 99,
            step: 1
          }}
          helperText={
            currentProduct 
              ? `Stock disponible: ${currentProduct.stock}`
              : 'Seleccione un producto'
          }
          disabled={!currentProduct || loading}
        />
        
        <TextField
          label="Precio"
          type="number"
          value={product.price}
          onChange={handlePriceChange}
          sx={{ flex: 1 }}
          inputProps={{ min: 0 }}
          disabled={!currentProduct || loading}
        />
        
        <Tooltip title="Eliminar producto">
          <IconButton 
            color="error" 
            onClick={() => onRemove(index)}
            sx={{ alignSelf: 'center' }}
            disabled={loading}
          >
            <RemoveCircleIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </motion.div>
  );
};

export function SaleForm({ open, onClose, onSaleAdded }: SaleFormProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const theme = useTheme();

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [paymentType, setPaymentType] = useState('contado');
  const [firstPayment, setFirstPayment] = useState('');
  const [secondPayment, setSecondPayment] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openClient, setOpenClient] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  // Cargar clientes y productos al abrir el modal
  useEffect(() => {
    if (!open || !userId) return;

    const fetchData = async () => {
      setLoadingData(true);
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
            id,
            quantity,
            min_stock,
            product_id,
            products (
              id,
              name,
              price,
              sku,
              category
            )
          `)
          .eq('user_id', userId)
          .gt('quantity', 0); // Solo productos con stock disponible

        if (error) throw error;

        // 3. Formatear los productos para el select
        const availableProducts = inventoryData
          .filter(item => item.products)
          .map(item => {
            // Determina si products es un array o un objeto
            const productData = Array.isArray(item.products) 
              ? item.products[0] 
              : item.products;
              
            return {
              id: item.product_id,
              name: productData?.name || 'Producto sin nombre',
              price: Number(productData?.price || 0),
              stock: Number(item.quantity || 0),
              sku: productData?.sku || '',
              category: productData?.category || 'Sin categoría'
            };
          });

        setProducts(availableProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Error cargando datos');
      } finally {
        setLoadingData(false);
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
    setErrorMessage('');
  }, [open, userId]);

  // Calcular total automáticamente
  useEffect(() => {
    const total = selectedProducts.reduce((acc, p) => acc + (p.quantity * p.price), 0);
    setAmount(total);
  }, [selectedProducts]);

  const handleProductChange = (index: number, field: string, value: any) => {
    setSelectedProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      if (updatedProducts[index]) {
        updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      }
      return updatedProducts;
    });
  };

  const handleAddProduct = () => {
    const newProduct: SelectedProduct = { 
      product_id: '', 
      quantity: 1, 
      price: 0 
    };
    setSelectedProducts(prev => [...prev, newProduct]);
  };

  const handleRemoveProduct = (index: number) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      setErrorMessage('');
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
    } catch (error: any) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  // Corregir el problema de validación del cliente
  const handleCreateClient = async (clientData: any) => {
    try {
      // Asegurarnos de que todos los campos estén en el formato correcto
      const formattedClientData = {
        name: clientData.name.trim(),
        document: clientData.document.trim(),
        email: clientData.email.trim() || null,
        phone: clientData.phone.trim() || null,
        birthday: clientData.birthday || null,
        consultant_id: userId
      };
      
      const { data, error } = await supabase
        .from('clients')
        .insert([formattedClientData])
        .select();
        
      if (error) {
        console.error('Error insertando cliente:', error);
        alert(`Error al crear cliente: ${error.message}`);
        return false;
      }
      
      if (data && data.length > 0) {
        // Añadir el nuevo cliente a la lista y seleccionarlo
        setClients([...clients, data[0]]);
        setSelectedClient(data[0]);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Error creando cliente:', error);
      alert(`Error inesperado: ${error.message}`);
      return false;
    }
  };

  // Validación del formulario
  const isFormValid = useMemo(() => {
    if (!selectedClient) return false;
    if (selectedProducts.length === 0) return false;
    
    for (const prod of selectedProducts) {
      if (!prod.product_id || prod.quantity <= 0) return false;
    }
    
    return true;
  }, [selectedClient, selectedProducts]);
  
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
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
        <span style={{ fontWeight: 600, fontSize: '1.25rem', letterSpacing: '0.5px' }}>
          Nueva Venta
        </span>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {errorMessage && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}

        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={30} sx={{ color: BRAND_COLOR }} />
          </Box>
        ) : (
          <>
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
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ShoppingCartIcon sx={{ color: BRAND_COLOR }} />
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Productos
              </Typography>
            </Box>
            
            <AnimatePresence>
              {selectedProducts.map((p, idx) => (
                <ProductItem 
                  key={`product-${idx}`}
                  product={p}
                  index={idx}
                  products={products}
                  onRemove={() => handleRemoveProduct(idx)}
                  onChange={handleProductChange}
                />
              ))}
            </AnimatePresence>
            
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

            {products.length === 0 && !loadingData && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No hay productos con stock disponible. Por favor, actualice su inventario.
              </Alert>
            )}

            {clients.length === 0 && !loadingData && (
              <Alert severity="info" sx={{ mb: 2 }}>
                No tiene clientes registrados. Por favor, agregue un cliente nuevo.
              </Alert>
            )}
          </>
        )}
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
          disabled={loading || !isFormValid}
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
      
      {openClient && (
        <NewClientForm 
          open={openClient}
          onClose={() => setOpenClient(false)}
          onClientCreated={handleCreateClient}
        />
      )}
    </Dialog>
  );
}