'use client'
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Chip, Box, TextField, MenuItem, Button, IconButton, Tooltip, 
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, useTheme,
  Alert, CircularProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BRAND_COLOR = '#FF90B3';

interface SaleProduct {
  quantity: number;
  price_at_sale: number;
  products: {
    name: string;
  };
}

interface Sale {
  id: string;
  created_at: string;
  amount: number;
  payment_type: 'contado' | 'quincenal' | 'mensual';
  payment_status: 'pagado' | 'pendiente';
  clients: {
    name: string;
  };
  sale_products: SaleProduct[];
}

export function SalesTable({ userId }: { userId: string }) {
  const theme = useTheme();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados de filtros
  const [filters, setFilters] = useState({
    search: '',
    paymentType: '',
    dateFrom: '',
    dateTo: ''
  });

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Función mejorada de fetch con manejo de errores
  const fetchSales = async () => {
    setLoading(true);
    setError('');
    try {
      const query = supabase
        .from('sales')
        .select(`
          *,
          clients!sales_client_id_fkey (name),
          sale_products (
            quantity,
            price_at_sale,
            products (name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.paymentType) {
        query.eq('payment_type', filters.paymentType);
      }
      if (filters.dateFrom) {
        query.gte('created_at', `${filters.dateFrom}T00:00:00`);
      }
      if (filters.dateTo) {
        query.lte('created_at', `${filters.dateTo}T23:59:59`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Filtrar por búsqueda de cliente
      let filtered = data || [];
      if (filters.search) {
        filtered = filtered.filter(sale =>
          sale.clients?.name?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setSales(filtered);
    } catch (err: any) {
      console.error('Error fetching sales:', err);
      setError('No se pudieron cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  // Memorizar los totales para evitar recálculos
  const totals = useMemo(() => {
    return sales.reduce((acc, sale) => ({
      total: acc.total + sale.amount,
      pending: acc.pending + (sale.payment_status === 'pendiente' ? sale.amount : 0)
    }), { total: 0, pending: 0 });
  }, [sales]);

  useEffect(() => {
    if (userId) fetchSales();
  }, [userId, filters]);

  const handleExport = () => {
    const csvRows = [
      ['Fecha', 'Cliente', 'Productos', 'Total', 'Tipo Pago', 'Estado'],
      ...sales.map(sale => [
        format(new Date(sale.created_at), 'dd/MM/yyyy'),
        sale.clients?.name || '-',
        sale.sale_products.map(sp => `${sp.products?.name} x${sp.quantity}`).join('; '),
        `$${sale.amount.toLocaleString()}`,
        sale.payment_type,
        sale.payment_status
      ])
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ventas_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

  if (!sales.length) {
    return (
      <Paper 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No hay ventas registradas
        </Typography>
      </Paper>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box>
          {/* Filtros y resumen */}
          <Box sx={{ 
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' }
          }}>
            {/* Filtros */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              flex: 1
            }}>
              <TextField
                size="small"
                placeholder="Buscar cliente..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ minWidth: 200 }}
              />
              <TextField
                select
                label="Tipo de pago"
                value={filters.paymentType}
                onChange={e => setFilters(f => ({ ...f, paymentType: e.target.value }))}
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="contado">Contado</MenuItem>
                <MenuItem value="quincenal">Quincenal</MenuItem>
                <MenuItem value="mensual">Mensual</MenuItem>
              </TextField>
              <TextField
                label="Desde"
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Hasta"
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Acciones */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
                sx={{
                  borderColor: BRAND_COLOR,
                  color: BRAND_COLOR,
                  '&:hover': {
                    borderColor: BRAND_COLOR,
                    bgcolor: `${BRAND_COLOR}10`
                  }
                }}
              >
                Exportar
              </Button>
            </Box>
          </Box>

          {/* Tabla */}
          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{ 
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Productos</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Tipo Pago</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow 
                    key={sale.id}
                    sx={{
                      bgcolor: sale.payment_type !== 'contado' && sale.payment_status === 'pendiente'
                        ? 'warning.light'
                        : 'inherit'
                    }}
                  >
                    <TableCell>
                      {format(new Date(sale.created_at), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{sale.clients?.name || '-'}</TableCell>
                    <TableCell>
                      <Tooltip title="Ver detalles">
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedSale(sale);
                            setDetailsOpen(true);
                          }}
                        >
                          Ver {sale.sale_products.length} productos
                        </Button>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="right">${sale.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={

                          sale.payment_type === 'contado' ? 'Contado' :
                          sale.payment_type === 'quincenal' ? 'Quincenal' : 'Mensual'
                        }
                        color={sale.payment_type === 'contado' ? 'success' : 'primary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sale.payment_status === 'pagado' ? 'Pagado' : 'Pendiente'}
                        color={sale.payment_status === 'pagado' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {sale.payment_status === 'pendiente' && (
                        <Tooltip title="Marcar como pagado">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleMarkAsPaid(sale.id)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Ver detalle">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedSale(sale);
                            setDetailsOpen(true);
                          }}
                        >
                          <ReceiptIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Modal de detalles mejorado */}
          <Dialog 
            open={detailsOpen} 
            onClose={() => setDetailsOpen(false)}
            maxWidth="sm"
            fullWidth
            TransitionProps={{
              enter: theme.transitions.duration.medium
            }}
          >
            <DialogTitle>Detalle de Venta</DialogTitle>
            <DialogContent>
              {selectedSale && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Cliente: {selectedSale.clients?.name}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Fecha: {format(new Date(selectedSale.created_at), 'dd/MM/yyyy', { locale: es })}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6">Productos:</Typography>
                  {selectedSale.sale_products.map((sp, idx) => (
                    <Box key={idx} sx={{ my: 1 }}>
                      <Typography>
                        {sp.products?.name}
                        <br />
                        Cantidad: {sp.quantity} x ${sp.price_at_sale} = ${sp.quantity * sp.price_at_sale}
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6">
                    Total: ${selectedSale.amount}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={`Pago: ${selectedSale.payment_type}`}
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`Estado: ${selectedSale.payment_status}`}
                      color={selectedSale.payment_status === 'pagado' ? 'success' : 'warning'}
                    />
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Cerrar</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}