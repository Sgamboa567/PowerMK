'use client'
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  IconButton,
  CircularProgress,
  useTheme,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { supabase } from '@/lib/supabase';

// Constantes
const BRAND_COLOR = '#FF90B3';

interface AddClientModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  userId: string;
}

interface ClientFormData {
  name: string;
  document: string;
  email: string;
  phone: string;
  birthday: string;
}

export function AddClientModal({ open, onClose, onAdded, userId }: AddClientModalProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    document: '',
    email: '',
    phone: '',
    birthday: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar mensajes de error cuando el usuario hace cambios
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.document) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Formatear datos para evitar errores en la BD
      // Removida la propiedad 'address' ya que no existe en el esquema
      const clientData = {
        name: formData.name.trim(),
        document: formData.document.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        birthday: formData.birthday || null,
        consultant_id: userId,
        created_at: new Date().toISOString()
        // updated_at no parece estar en el esquema según el error
      };
      
      const { error: supabaseError } = await supabase
        .from('clients')
        .insert([clientData]);
      
      if (supabaseError) {
        console.error('Error al crear cliente:', supabaseError);
        setError(`Error: ${supabaseError.message}`);
        return;
      }
      
      // Resetear formulario
      setFormData({
        name: '',
        document: '',
        email: '',
        phone: '',
        birthday: ''
      });
      
      // Cerrar modal y recargar datos
      onClose();
      onAdded();
      
    } catch (err: any) {
      console.error('Error inesperado:', err);
      setError(err.message || 'Ocurrió un error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(145deg, #1A1A1A 0%, #242424 100%)'
            : 'linear-gradient(145deg, #FFFFFF 0%, #F8F8F8 100%)'
        }
      }}
      aria-labelledby="client-dialog-title"
      aria-describedby="client-dialog-description"
    >
      <DialogTitle 
        id="client-dialog-title"
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon sx={{ color: BRAND_COLOR }} />
          <span style={{ fontWeight: 500, fontSize: '1.25rem' }}>
            Nuevo Cliente
          </span>
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
          aria-label="cerrar"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                InputProps={{ spellCheck: false }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Documento"
                name="document"
                value={formData.document}
                onChange={handleChange}
                required
                InputProps={{ spellCheck: false }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                InputProps={{ spellCheck: false }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{ spellCheck: false }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de nacimiento"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {/* Campo de dirección eliminado porque no existe en el esquema */}
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, px: 3 }}>
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
}