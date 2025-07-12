'use client'
import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Chip, Box, TextField, MenuItem, Button, IconButton, Tooltip, 
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, useTheme,
  Alert, CircularProgress, Stack, Badge, Grid, TablePagination
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { format, subDays } from 'date-fns';
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

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
  const fetchSales = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError('');
    try {
      const query = supabase
        .from('sales')
        .select(`
          *,
          clients:fk_sales_client(name),
          sale_products:fk_sale_products_sale(
            quantity,
            price_at_sale,
            products:fk_sale_products_product(name)
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
  }, [userId, filters]);

  // Función para marcar como pagado
  const handleMarkAsPaid = useCallback(async (saleId: string) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({ payment_status: 'pagado' })
        .eq('id', saleId);
      
      if (error) throw error;
      
      // Actualizar la lista local
      await fetchSales();
      
      // Si el modal de detalles está abierto con esta venta, actualizar el estado
      if (selectedSale?.id === saleId) {
        setSelectedSale(prev => prev ? {...prev, payment_status: 'pagado'} : null);
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('No se pudo actualizar el estado de pago');
    }
  }, [fetchSales, selectedSale]);

  // Memorizar los totales para evitar recálculos
  const totals = useMemo(() => {
    return sales.reduce((acc, sale) => ({
      total: acc.total + sale.amount,
      pending: acc.pending + (sale.payment_status === 'pendiente' ? sale.amount : 0)
    }), { total: 0, pending: 0 });
  }, [sales]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleExport = useCallback(() => {
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
  }, [sales]);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      paymentType: '',
      dateFrom: '',
      dateTo: ''
    });
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const setLast7Days = useCallback(() => {
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    
    setFilters(prev => ({
      ...prev,
      dateFrom: format(sevenDaysAgo, 'yyyy-MM-dd'),
      dateTo: format(today, 'yyyy-MM-dd')
    }));
  }, []);

  const setCurrentMonth = useCallback(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setFilters(prev => ({
      ...prev,
      dateFrom: format(firstDayOfMonth, 'yyyy-MM-dd'),
      dateTo: format(today, 'yyyy-MM-dd')
    }));
  }, []);

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'contado':
        return theme.palette.mode === 'dark' 
          ? alpha(theme.palette.success.main, 0.2)
          : alpha(theme.palette.success.main, 0.1);
      case 'quincenal':
        return theme.palette.mode === 'dark'
          ? alpha(theme.palette.info.main, 0.2)
          : alpha(theme.palette.info.main, 0.1);
      case 'mensual':
        return theme.palette.mode === 'dark'
          ? alpha(theme.palette.primary.main, 0.2)
          : alpha(theme.palette.primary.main, 0.1);
      default:
        return theme.palette.mode === 'dark'
          ? alpha(theme.palette.common.white, 0.1)
          : alpha(theme.palette.common.black, 0.05);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'pagado'
      ? theme.palette.mode === 'dark'
        ? alpha(theme.palette.success.main, 0.2)
        : alpha(theme.palette.success.main, 0.1)
      : theme.palette.mode === 'dark'
        ? alpha(theme.palette.warning.main, 0.15)
        : alpha(theme.palette.warning.main, 0.08);
  };

  const getStatusTextColor = (status: string) => {
    return status === 'pagado'
      ? theme.palette.success.main
      : theme.palette.warning.main;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 200 
      }}>
        <CircularProgress size={32} sx={{ color: BRAND_COLOR }} />
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

  // Calcular datos de paginación
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, sales.length - page * rowsPerPage);
  const visibleSales = sales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const MotionTableRow = motion(TableRow);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="salesTable"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box>
          {/* Resumen de ventas - Tarjetas con estadísticas */}
          <Box
            sx={{
              mb: 4,
              display: 'flex',
              gap: { xs: 2, md: 4 },
              flexWrap: 'wrap'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                py: 1.5,
                px: 2.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flex: '1 0 auto',
                minWidth: { xs: '100%', sm: 'auto' },
                bgcolor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(BRAND_COLOR, 0.05),
                border: `1px solid ${
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(BRAND_COLOR, 0.2)
                }`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(BRAND_COLOR, 0.15)}`
                }
              }}
            >
              <AttachMoneyIcon sx={{ color: BRAND_COLOR }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Ventas Totales
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: BRAND_COLOR }}>
                  ${totals.total.toLocaleString()}
                </Typography>
              </Box>
            </Paper>

            {totals.pending > 0 && (
              <Paper
                elevation={0}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flex: '1 0 auto',
                  minWidth: { xs: '100%', sm: 'auto' },
                  bgcolor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.warning.main, 0.1)
                    : alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.warning.main, 0.2)
                      : alpha(theme.palette.warning.main, 0.2)
                  }`,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.15)}`
                  }
                }}
              >
                <Badge
                  badgeContent={sales.filter(s => s.payment_status === 'pendiente').length}
                  color="warning"
                >
                  <AttachMoneyIcon sx={{ color: theme.palette.warning.main }} />
                </Badge>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Pagos Pendientes
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                    ${totals.pending.toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Box>

          {/* Filtros y acciones - Diseño mejorado */}
          <Paper
            elevation={0}
            sx={{ 
              p: 2.5, 
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: showFilters ? 2 : 0 
            }}>
              <TextField
                placeholder="Buscar cliente..."
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                  ),
                  endAdornment: filters.search ? (
                    <IconButton 
                      size="small" 
                      onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ) : null
                }}
                sx={{ 
                  minWidth: 200, 
                  flexGrow: 1, 
                  mr: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
                size="small"
              />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    borderColor: BRAND_COLOR,
                    color: BRAND_COLOR,
                    '&:hover': {
                      borderColor: BRAND_COLOR,
                      bgcolor: `${BRAND_COLOR}10`
                    }
                  }}
                >
                  {showFilters ? 'Ocultar filtros' : 'Filtros'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExport}
                  sx={{
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  Exportar
                </Button>
                
                {(filters.search || filters.paymentType || filters.dateFrom || filters.dateTo) && (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleResetFilters}
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Limpiar
                  </Button>
                )}
              </Box>
            </Box>
            
            {/* Filtros expandibles */}
            {showFilters && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      select
                      label="Tipo de pago"
                      value={filters.paymentType}
                      onChange={e => setFilters(f => ({ ...f, paymentType: e.target.value }))}
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="contado">Contado</MenuItem>
                      <MenuItem value="quincenal">Quincenal</MenuItem>
                      <MenuItem value="mensual">Mensual</MenuItem>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Desde"
                      type="date"
                      value={filters.dateFrom}
                      onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="Hasta"
                      type="date"
                      value={filters.dateTo}
                      onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={setLast7Days}
                        sx={{
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        Últimos 7 días
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={setCurrentMonth}
                        sx={{
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        Este mes
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {sales.length} venta{sales.length !== 1 ? 's' : ''} encontrada{sales.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* Tabla mejorada */}
          <Paper 
            elevation={0}
            sx={{ 
              width: '100%', 
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white'
            }}
          >
            <TableContainer sx={{ maxHeight: 650 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {[
                      { label: "Fecha", align: "left" },
                      { label: "Cliente", align: "left" },
                      { label: "Productos", align: "left" },
                      { label: "Total", align: "right" },
                      { label: "Tipo Pago", align: "left" },
                      { label: "Estado", align: "left" },
                      { label: "Acciones", align: "right" }
                    ].map((header, index) => (
                      <TableCell 
                        key={index}
                        align={header.align as "left" | "right" | "center" | "justify" | "inherit"}
                        sx={{ 
                          fontWeight: 600, 
                          position: 'sticky',
                          top: 0,
                          zIndex: 2,
                          // Degradado rosado atractivo - igual que en InventoryTable
                          bgcolor: theme.palette.mode === 'dark' 
                            ? alpha(BRAND_COLOR, 0.1)
                            : alpha(BRAND_COLOR, 0.05),
                          // Base sólida para evitar transparencias
                          '&:after': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: '100%',
                            zIndex: -1,
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? 'rgba(30, 30, 30, 0.95)'
                              : 'rgba(255, 255, 255, 0.95)',
                          },
                          borderBottom: `2px solid ${alpha(BRAND_COLOR, 0.4)}`,
                          color: theme.palette.mode === 'dark' ? 'white' : 'rgba(0,0,0,0.87)',
                          paddingTop: '12px',
                          paddingBottom: '12px',
                        }}
                      >
                        {header.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {visibleSales.map((sale, index) => (
                      <MotionTableRow
                        key={sale.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        sx={{
                          bgcolor: sale.payment_type !== 'contado' && sale.payment_status === 'pendiente'
                            ? theme.palette.mode === 'dark'
                              ? alpha(theme.palette.warning.main, 0.05)
                              : alpha(theme.palette.warning.main, 0.02)
                            : 'inherit',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark'
                              ? alpha(theme.palette.primary.main, 0.1)
                              : alpha(theme.palette.primary.main, 0.05),
                          },
                          borderLeft: sale.payment_status === 'pendiente'
                            ? `3px solid ${theme.palette.warning.main}`
                            : 'none'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {format(
                              // Ajustar la fecha manualmente para Colombia (GMT-5)
                              new Date(new Date(sale.created_at).getTime() - 5 * 60 * 60 * 1000),
                              'dd/MM/yyyy',
                              { locale: es }
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(
                              new Date(new Date(sale.created_at).getTime() - 5 * 60 * 60 * 1000),
                              'HH:mm',
                              { locale: es }
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {sale.clients?.name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => {
                              setSelectedSale(sale);
                              setDetailsOpen(true);
                            }}
                            sx={{
                              fontWeight: 400,
                              color: theme.palette.primary.main,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                              }
                            }}
                          >
                            {sale.sale_products.length} {sale.sale_products.length === 1 ? 'producto' : 'productos'}
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 600, color: BRAND_COLOR }}>
                            ${sale.amount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              sale.payment_type === 'contado' ? 'Contado' :
                              sale.payment_type === 'quincenal' ? 'Quincenal' : 'Mensual'
                            }
                            sx={{
                              bgcolor: getPaymentTypeColor(sale.payment_type),
                              color: sale.payment_type === 'contado'
                                ? theme.palette.success.main
                                : sale.payment_type === 'quincenal'
                                  ? theme.palette.info.main
                                  : theme.palette.primary.main,
                              '& .MuiChip-label': {
                                fontWeight: 500,
                                px: 1
                              },
                              border: '1px solid',
                              borderColor: sale.payment_type === 'contado'
                                ? alpha(theme.palette.success.main, 0.3)
                                : sale.payment_type === 'quincenal'
                                  ? alpha(theme.palette.info.main, 0.3)
                                  : alpha(theme.palette.primary.main, 0.3)
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={sale.payment_status === 'pagado' ? 'Pagado' : 'Pendiente'}
                            color={sale.payment_status === 'pagado' ? 'success' : 'warning'}
                            variant="outlined"
                            sx={{
                              fontWeight: 500,
                              '& .MuiChip-label': {
                                px: 1
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            {sale.payment_status === 'pendiente' && (
                              <Tooltip title="Marcar como pagado">
                                <IconButton
                                  size="small"
                                  onClick={() => handleMarkAsPaid(sale.id)}
                                  sx={{
                                    color: theme.palette.mode === 'dark'
                                      ? theme.palette.success.light
                                      : theme.palette.success.main,
                                    bgcolor: theme.palette.mode === 'dark'
                                      ? alpha(theme.palette.success.main, 0.1)
                                      : alpha(theme.palette.success.main, 0.05),
                                    '&:hover': {
                                      bgcolor: theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.success.main, 0.2)
                                        : alpha(theme.palette.success.main, 0.1),
                                    }
                                  }}
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setDetailsOpen(true);
                                }}
                                sx={{
                                  color: theme.palette.mode === 'dark'
                                    ? theme.palette.primary.light
                                    : theme.palette.primary.main,
                                  bgcolor: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.primary.main, 0.1)
                                    : alpha(theme.palette.primary.main, 0.05),
                                  '&:hover': {
                                    bgcolor: theme.palette.mode === 'dark'
                                      ? alpha(theme.palette.primary.main, 0.2)
                                      : alpha(theme.palette.primary.main, 0.1),
                                  }
                                }}
                              >
                                <ReceiptIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </MotionTableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Paginación */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={sales.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página"
              sx={{
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.02)' 
                  : 'transparent',
                '.MuiTablePagination-selectIcon': {
                  color: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.5)
                    : undefined
                }
              }}
            />
          </Paper>

          {/* Modal de detalles mejorado */}
          <Dialog 
            open={detailsOpen} 
            onClose={() => setDetailsOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '12px',
                border: theme.palette.mode === 'dark'
                  ? `1px solid ${alpha(BRAND_COLOR, 0.2)}`
                  : 'none',
                overflow: 'hidden'
              }
            }}
          >
            <DialogTitle sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: BRAND_COLOR,
              color: 'white',
              px: 3,
              py: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Detalle de Venta
                </Typography>
              </Box>
              <IconButton 
                size="small" 
                onClick={() => setDetailsOpen(false)}
                sx={{ color: 'white' }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              {selectedSale && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Cliente
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedSale.clients?.name || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Fecha
                      </Typography>
                      <Typography variant="body1">
                        {format(
                          new Date(selectedSale.created_at),
                          'dd MMMM yyyy',
                          { locale: es }
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 2.5 }} />
                  
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 500 }}>
                    Productos
                  </Typography>
                  
                  <TableContainer component={Paper} elevation={0} sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 3,
                    borderRadius: '8px'
                  }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500 }}>Producto</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500 }}>Cantidad</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>Precio</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSale.sale_products.map((sp, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{sp.products?.name}</TableCell>
                            <TableCell align="center">{sp.quantity}</TableCell>
                            <TableCell align="right">${sp.price_at_sale.toLocaleString()}</TableCell>
                            <TableCell align="right">${(sp.quantity * sp.price_at_sale).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: BRAND_COLOR }}>
                      ${selectedSale.amount.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                    <Chip
                      size="small"
                      label={
                        selectedSale.payment_type === 'contado' ? 'Pago: Contado' :
                        selectedSale.payment_type === 'quincenal' ? 'Pago: Quincenal' : 'Pago: Mensual'
                      }
                      sx={{
                        bgcolor: getPaymentTypeColor(selectedSale.payment_type),
                        color: selectedSale.payment_type === 'contado'
                          ? theme.palette.success.main
                          : selectedSale.payment_type === 'quincenal'
                            ? theme.palette.info.main
                            : theme.palette.primary.main,
                        '& .MuiChip-label': {
                          fontWeight: 500,
                          px: 1.5
                        }
                      }}
                    />
                    
                    <Chip
                      size="small"
                      label={
                        `Estado: ${selectedSale.payment_status === 'pagado' ? 'Pagado' : 'Pendiente'}`
                      }
                      color={selectedSale.payment_status === 'pagado' ? 'success' : 'warning'}
                      variant="outlined"
                      sx={{
                        fontWeight: 500,
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                    />
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}>
              {selectedSale?.payment_status === 'pendiente' && (
                <Button 
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    if (selectedSale) {
                      handleMarkAsPaid(selectedSale.id);
                    }
                  }}
                  sx={{ 
                    bgcolor: theme.palette.success.main,
                    '&:hover': {
                      bgcolor: theme.palette.success.dark
                    },
                    mr: 'auto'
                  }}
                >
                  Marcar como pagado
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => setDetailsOpen(false)}
              >
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}