'use client'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  IconButton, 
  Box, 
  Typography, 
  CircularProgress,
  Divider,
  ButtonGroup,
  Tooltip,
  useTheme,
  Stack,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import InventoryIcon from '@mui/icons-material/Inventory';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import { supabase } from '@/lib/supabase';

const BRAND_COLOR = '#FF90B3';

interface EditInventoryModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  inventoryId: string;
  currentQuantity: number;
  productName: string;
}

export function EditInventoryModal({ 
  open, 
  onClose, 
  onUpdated, 
  inventoryId, 
  currentQuantity, 
  productName 
}: EditInventoryModalProps) {
  const theme = useTheme();
  const [quantity, setQuantity] = useState(currentQuantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [amountToAdjust, setAmountToAdjust] = useState(1);

  // Resetear los estados cuando cambia el item o se abre el modal
  useEffect(() => {
    if (open) {
      setQuantity(currentQuantity);
      setError('');
      setAmountToAdjust(1);
      setTabValue(0);
    }
  }, [currentQuantity, open]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSave = async () => {
    if (quantity < 0) {
      setError('La cantidad no puede ser negativa');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity })
        .eq('id', inventoryId);
      
      if (error) throw error;
      
      onUpdated();
      onClose();
    } catch (err: any) {
      console.error('Error updating inventory:', err);
      setError(err.message || 'No se pudo actualizar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este producto del inventario?')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', inventoryId);
      
      if (error) throw error;
      
      onUpdated();
      onClose();
    } catch (err: any) {
      console.error('Error deleting inventory item:', err);
      setError(err.message || 'No se pudo eliminar el producto');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para modificar la cantidad
  const increment = () => setQuantity(prev => prev + amountToAdjust);
  const decrement = () => {
    const newQuantity = quantity - amountToAdjust;
    setQuantity(newQuantity < 0 ? 0 : newQuantity);
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose} 
      maxWidth="xs" 
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
        pr: 1,
        pb: 1
      }}>
        <Box>Gestionar Stock</Box>
        <IconButton 
          size="small" 
          onClick={onClose}
          disabled={loading}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.03)' 
            : 'rgba(0,0,0,0.02)'
        }}
      >
        <Tab 
          icon={<InventoryIcon fontSize="small" />} 
          iconPosition="start"
          label="Agregar" 
          sx={{
            '&.Mui-selected': {
              color: theme.palette.mode === 'dark' ? BRAND_COLOR : '#D23369',
            }
          }}
        />
        <Tab 
          icon={<RemoveShoppingCartIcon fontSize="small" />} 
          iconPosition="start"
          label="Descontar" 
          sx={{
            '&.Mui-selected': {
              color: theme.palette.mode === 'dark' ? BRAND_COLOR : '#D23369',
            }
          }}
        />
      </Tabs>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {productName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stock actual: <strong>{currentQuantity}</strong> unidades
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {tabValue === 0 ? (
          // Pestaña de Agregar Stock
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Cantidad a agregar:
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <TextField
                value={amountToAdjust}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1) {
                    setAmountToAdjust(val);
                  } else if (e.target.value === '') {
                    setAmountToAdjust(1);
                  }
                }}
                type="number"
                size="small"
                inputProps={{ min: 1 }}
                sx={{ width: 100 }}
              />
              
              <Button 
                variant="contained"
                startIcon={<AddIcon />}
                onClick={increment}
                sx={{
                  bgcolor: theme.palette.success.main,
                  '&:hover': {
                    bgcolor: theme.palette.success.dark
                  }
                }}
              >
                Agregar
              </Button>
            </Box>
            
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <Button 
                variant="outlined"
                size="small"
                onClick={() => {
                  setAmountToAdjust(1);
                  setQuantity(currentQuantity + 1);
                }}
                sx={{
                  borderColor: theme.palette.success.main,
                  color: theme.palette.success.main,
                  '&:hover': {
                    borderColor: theme.palette.success.main,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                  }
                }}
              >
                +1
              </Button>
              <Button 
                variant="outlined"
                size="small"
                onClick={() => {
                  setAmountToAdjust(5);
                  setQuantity(currentQuantity + 5);
                }}
                sx={{
                  borderColor: theme.palette.success.main,
                  color: theme.palette.success.main,
                  '&:hover': {
                    borderColor: theme.palette.success.main,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                  }
                }}
              >
                +5
              </Button>
              <Button 
                variant="outlined"
                size="small"
                onClick={() => {
                  setAmountToAdjust(10);
                  setQuantity(currentQuantity + 10);
                }}
                sx={{
                  borderColor: theme.palette.success.main,
                  color: theme.palette.success.main,
                  '&:hover': {
                    borderColor: theme.palette.success.main,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                  }
                }}
              >
                +10
              </Button>
            </Stack>
          </Box>
        ) : (
          // Pestaña de Descontar Stock
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Cantidad a descontar:
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <TextField
                value={amountToAdjust}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1 && val <= currentQuantity) {
                    setAmountToAdjust(val);
                  } else if (e.target.value === '') {
                    setAmountToAdjust(1);
                  }
                }}
                type="number"
                size="small"
                inputProps={{ min: 1, max: currentQuantity }}
                sx={{ width: 100 }}
                error={amountToAdjust > currentQuantity}
                helperText={amountToAdjust > currentQuantity ? "Excede el stock disponible" : ""}
              />
              
              <Button 
                variant="contained"
                startIcon={<RemoveIcon />}
                onClick={decrement}
                disabled={currentQuantity === 0 || amountToAdjust > currentQuantity}
                sx={{
                  bgcolor: theme.palette.error.main,
                  '&:hover': {
                    bgcolor: theme.palette.error.dark
                  }
                }}
              >
                Descontar
              </Button>
            </Box>
            
            {currentQuantity > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                <Button 
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setAmountToAdjust(1);
                    setQuantity(Math.max(0, currentQuantity - 1));
                  }}
                  disabled={currentQuantity < 1}
                  sx={{
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                    '&:hover': {
                      borderColor: theme.palette.error.main,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    }
                  }}
                >
                  -1
                </Button>
                <Button 
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setAmountToAdjust(5);
                    setQuantity(Math.max(0, currentQuantity - 5));
                  }}
                  disabled={currentQuantity < 5}
                  sx={{
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                    '&:hover': {
                      borderColor: theme.palette.error.main,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    }
                  }}
                >
                  -5
                </Button>
                <Button 
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setAmountToAdjust(currentQuantity);
                    setQuantity(0);
                  }}
                  sx={{
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                    '&:hover': {
                      borderColor: theme.palette.error.main,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                    }
                  }}
                >
                  Todo
                </Button>
              </Stack>
            )}
            
            {currentQuantity === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Este producto no tiene stock disponible para descontar.
              </Alert>
            )}
          </Box>
        )}
        
        <Box sx={{ 
          p: 2, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          mt: 2,
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.03)'
            : 'rgba(0,0,0,0.02)'
        }}>
          <Typography variant="subtitle2" gutterBottom>
            Resultado:
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: quantity > currentQuantity 
                ? theme.palette.success.main 
                : quantity < currentQuantity 
                  ? theme.palette.error.main
                  : 'inherit'
            }}
          >
            {quantity} unidades
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {quantity > currentQuantity 
              ? `(+${quantity - currentQuantity} unidades)` 
              : quantity < currentQuantity 
                ? `(-${currentQuantity - quantity} unidades)`
                : '(sin cambios)'}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={loading}
            sx={{
              borderRadius: 2,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(244, 67, 54, 0.2)'
                  : 'rgba(244, 67, 54, 0.1)'
              }
            }}
          >
            Eliminar
          </Button>
        </Box>
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
          onClick={handleSave}
          disabled={loading || quantity < 0 || quantity === currentQuantity}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          sx={{
            bgcolor: BRAND_COLOR,
            '&:hover': {
              bgcolor: '#e57a9e'
            }
          }}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}