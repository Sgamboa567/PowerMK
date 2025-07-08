'use client'
import { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, IconButton, Tooltip, Typography, Chip,
  CircularProgress, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { AddInventoryModal } from './AddInventoryModal';
import { EditInventoryModal } from './EditInventoryModal';

const BRAND_COLOR = '#FF90B3';

interface Product {
  name: string;
  sku: string;
  price: number;
  min_stock: number;
}

interface InventoryItem {
  id: string;
  quantity: number;
  product: Product;
}

interface RawInventoryData {
  id: string;
  quantity: number;
  product: {
    name: string;
    sku: string;
    price: number;
    min_stock: number;
  };
}

interface Props {
  userId?: string;
  addOpen: boolean;
  setAddOpen: (open: boolean) => void;
}

export function InventoryTable({ userId, addOpen, setAddOpen }: Props) {
  const theme = useTheme();
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          min_stock,
          product:products (
            name,
            sku,
            price
          )
        `)
        .eq('user_id', session.user.id)
        .order('id');

      if (error) throw error;

      const formattedData: InventoryItem[] = (data as RawInventoryData[]).map(item => ({
        id: item.id,
        quantity: item.quantity,
        product: {
          name: item.product.name,
          sku: item.product.sku,
          price: item.product.price,
          min_stock: item.min_stock
        }
      }));

      setInventory(formattedData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('No se pudo cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [session]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 200 
      }}>
        <CircularProgress sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}
    >
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,144,179,0.1)' 
                    : 'rgba(255,144,179,0.05)'
                }}
              >
                SKU
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,144,179,0.1)' 
                    : 'rgba(255,144,179,0.05)'
                }}
              >
                Producto
              </TableCell>
              <TableCell align="right" 
                sx={{ 
                  fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,144,179,0.1)' 
                    : 'rgba(255,144,179,0.05)'
                }}
              >
                Precio
              </TableCell>
              <TableCell align="right" 
                sx={{ 
                  fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,144,179,0.1)' 
                    : 'rgba(255,144,179,0.05)'
                }}
              >
                Stock
              </TableCell>
              <TableCell 
                sx={{ 
                  fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,144,179,0.1)' 
                    : 'rgba(255,144,179,0.05)'
                }}
              >
                Estado
              </TableCell>
              <TableCell align="right" 
                sx={{ 
                  fontWeight: 600,
                  bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,144,179,0.1)' 
                    : 'rgba(255,144,179,0.05)'
                }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {inventory
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    component={TableRow}
                    sx={{
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.05)' 
                          : 'rgba(255,144,179,0.05)'
                      }
                    }}
                  >
                    <TableCell>{item.product.sku}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.product.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: BRAND_COLOR,
                          fontWeight: 600 
                        }}
                      >
                        ${item.product.price.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        sx={{ fontWeight: 500 }}
                      >
                        {item.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.quantity <= item.product.min_stock ? (
                        <Chip
                          icon={<WarningIcon />}
                          label="Stock Bajo"
                          color="warning"
                          size="small"
                          sx={{ 
                            '& .MuiChip-label': { fontWeight: 500 }
                          }}
                        />
                      ) : (
                        <Chip
                          label="En Stock"
                          color="success"
                          size="small"
                          sx={{ 
                            '& .MuiChip-label': { fontWeight: 500 }
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar Stock">
                        <IconButton 
                          size="small" 
                          onClick={() => { 
                            setSelectedItem(item); 
                            setEditOpen(true); 
                          }}
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: BRAND_COLOR,
                              bgcolor: `${BRAND_COLOR}15`
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reponer">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedItem(item);
                            setEditOpen(true);
                          }}
                          sx={{
                            color: BRAND_COLOR,
                            '&:hover': {
                              bgcolor: `${BRAND_COLOR}15`
                            }
                          }}
                        >
                          <AddCircleIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </motion.tr>
                ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={inventory.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          '.MuiTablePagination-select': {
            borderRadius: 1
          }
        }}
      />
      
      {/* Modales */}
      <AddInventoryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={fetchInventory}
        userId={userId || ''}
      />
      
      <EditInventoryModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={fetchInventory}
        inventoryId={selectedItem?.id || ''}
        currentQuantity={selectedItem?.quantity || 0}
        productName={selectedItem?.product.name || ''}
      />
    </Paper>
  );
}