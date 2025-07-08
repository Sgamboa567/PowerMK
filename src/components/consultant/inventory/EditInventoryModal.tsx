import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, Box, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface EditInventoryModalProps {
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  inventoryId: string;
  currentQuantity: number;
  productName: string;
}

export function EditInventoryModal({ open, onClose, onUpdated, inventoryId, currentQuantity, productName }: EditInventoryModalProps) {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await supabase
      .from('inventory')
      .update({ quantity })
      .eq('id', inventoryId);
    setLoading(false);
    onUpdated();
    onClose();
  };

  const handleDelete = async () => {
    setLoading(true);
    await supabase
      .from('inventory')
      .delete()
      .eq('id', inventoryId);
    setLoading(false);
    onUpdated();
    onClose();
  };

  const handleReponer = () => setQuantity(quantity + 1);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Editar Stock</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>{productName}</Typography>
        <TextField
          label="Cantidad"
          type="number"
          fullWidth
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          inputProps={{ min: 0 }}
          sx={{ mb: 2 }}
        />
        <Button variant="outlined" onClick={handleReponer} sx={{ mr: 2 }}>
          Reponer +1
        </Button>
        <IconButton color="error" onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}