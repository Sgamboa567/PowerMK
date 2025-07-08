'use client'
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Grid,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from '@/lib/supabase';

interface EditClientModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  client: Client | null;
}

export function EditClientModal({ open, onClose, onSaved, client }: EditClientModalProps) {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    birthday: '',
    address: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        document: client.document || '',
        phone: client.phone || '',
        email: client.email || '',
        birthday: client.birthday || '',
        address: client.address || '',
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', client?.id);

      if (error) throw error;

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error updating client:', error);
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
        Editar Cliente
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
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Documento"
                required
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de nacimiento"
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button 
            type="submit"
            variant="contained"
            sx={{ 
              bgcolor: '#FF90B3',
              '&:hover': {
                bgcolor: '#e57a9e'
              }
            }}
          >
            Guardar cambios
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}