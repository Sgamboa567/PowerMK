'use client'
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Badge,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useTheme, alpha } from '@mui/material/styles';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { format, differenceInDays, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { AddClientModal } from './AddClientModal';
import { EditClientModal } from './EditClientModal';

const BRAND_COLOR = '#FF90B3';
const BRAND_COLOR_LIGHT = alpha('#FF90B3', 0.1);

interface Sale {
  created_at: string;
  amount: number;
  payment_status?: string;
}

interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  birthday: string | null;
  address?: string;
  sales?: Sale[];
  last_purchase?: string | null;
  total_purchases?: number;
  pending_payments?: number;
}

interface FormattedClient extends Client {
  last_purchase: string | null;
  total_purchases: number;
  pending_payments: number;
  days_since_purchase: number | null;
}

interface Props {
  addOpen?: boolean;
  setAddOpen?: (open: boolean) => void;
}

interface Filters {
  search: string;
  purchaseStatus: string;
  paymentStatus: string;
  birthdaySoon: boolean;
}

export function ClientsTable({ addOpen = false, setAddOpen = () => {} }: Props) {
  const theme = useTheme();
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [clients, setClients] = useState<FormattedClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<FormattedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    purchaseStatus: 'all',
    paymentStatus: 'all',
    birthdaySoon: false
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch clients mejorado con información de pagos pendientes
  const fetchClients = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          sales(
            created_at,
            amount,
            payment_status
          )
        `)
        .eq('consultant_id', session.user.id)
        .order('name');

      if (error) throw error;

      const formattedClients = data.map((client: Client): FormattedClient => {
        const sales = client.sales || [];
        const sortedSales = [...sales].sort((a: Sale, b: Sale) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const lastPurchase = sortedSales.length > 0 ? sortedSales[0].created_at : null;
        const daysSincePurchase = lastPurchase 
          ? differenceInDays(new Date(), new Date(lastPurchase)) 
          : null;
          
        const pendingPayments = sales
          .filter(sale => sale.payment_status === 'pendiente')
          .reduce((sum, sale) => sum + sale.amount, 0);
        
        return {
          ...client,
          last_purchase: lastPurchase,
          days_since_purchase: daysSincePurchase,
          total_purchases: sales.reduce((sum: number, sale: Sale) => sum + sale.amount, 0),
          pending_payments: pendingPayments
        };
      });

      setClients(formattedClients);
      setFilteredClients(formattedClients); // Inicialmente mostramos todos los clientes
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('No se pudo cargar la información de los clientes');
    } finally {
      setLoading(false);
    }
  };

  // Usar fetchClients en useEffect
  useEffect(() => {
    fetchClients();
  }, [session]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    let result = [...clients];

    // Filtrar por búsqueda (nombre, documento, teléfono o email)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        client => 
          client.name.toLowerCase().includes(searchLower) ||
          client.document.toLowerCase().includes(searchLower) ||
          client.phone.toLowerCase().includes(searchLower) ||
          (client.email && client.email.toLowerCase().includes(searchLower))
      );
    }

    // Filtrar por estado de compras
    if (filters.purchaseStatus === 'with-purchases') {
      result = result.filter(client => client.total_purchases > 0);
    } else if (filters.purchaseStatus === 'without-purchases') {
      result = result.filter(client => client.total_purchases === 0);
    } else if (filters.purchaseStatus === 'inactive') {
      result = result.filter(client => 
        client.days_since_purchase !== null && 
        client.days_since_purchase > 60
      );
    }

    // Filtrar por estado de pagos
    if (filters.paymentStatus === 'pending') {
      result = result.filter(client => client.pending_payments > 0);
    } else if (filters.paymentStatus === 'paid') {
      result = result.filter(client => client.total_purchases > 0 && client.pending_payments === 0);
    }

    // Filtrar por cumpleaños próximo (en los próximos 30 días)
    if (filters.birthdaySoon) {
      const today = new Date();
      const nextMonth = addDays(today, 30);
      
      result = result.filter(client => {
        if (!client.birthday) return false;
        
        const birthday = new Date(client.birthday);
        const birthdayThisYear = new Date(
          today.getFullYear(),
          birthday.getMonth(),
          birthday.getDate()
        );
        
        // Si ya pasó el cumpleaños este año, verificamos para el próximo año
        if (isBefore(birthdayThisYear, today)) {
          const birthdayNextYear = new Date(
            today.getFullYear() + 1,
            birthday.getMonth(),
            birthday.getDate()
          );
          return isBefore(birthdayNextYear, nextMonth);
        }
        
        return isBefore(birthdayThisYear, nextMonth);
      });
    }

    setFilteredClients(result);
    setPage(0); // Reset a la primera página cuando se aplican filtros
  }, [filters, clients]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleWhatsAppClick = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hola ${name}, ¿cómo estás?`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  // Funciones de manejo CRUD
  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setEditOpen(true);
  };

  const handleDelete = async (clientId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      setError('No se pudo eliminar el cliente');
    }
  };

  const handleScheduleFollowup = (client: Client) => {
    // Implementar integración con calendario
    console.log('Programar seguimiento para:', client.name);
  };
  
  const handleResetFilters = () => {
    setFilters({
      search: '',
      purchaseStatus: 'all',
      paymentStatus: 'all',
      birthdaySoon: false
    });
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
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    );
  }

  if (!clients.length) {
    return (
      <Paper 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(0,0,0,0.02)'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No hay clientes registrados
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      {/* Barra de búsqueda y filtros */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 2, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: showFilters ? 2 : 0 }}>
          <TextField
            placeholder="Buscar clientes..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: filters.search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setFilters(prev => ({ ...prev, search: '' }))}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            sx={{ 
              flexGrow: 1,
              mr: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
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
            
            {(filters.search || filters.purchaseStatus !== 'all' || filters.paymentStatus !== 'all' || filters.birthdaySoon) && (
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
        
        {showFilters && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Estado de compras</InputLabel>
                  <Select
                    value={filters.purchaseStatus}
                    label="Estado de compras"
                    onChange={(e) => setFilters(prev => ({ ...prev, purchaseStatus: e.target.value }))}
                  >
                    <MenuItem value="all">Todos los clientes</MenuItem>
                    <MenuItem value="with-purchases">Con compras</MenuItem>
                    <MenuItem value="without-purchases">Sin compras</MenuItem>
                    <MenuItem value="inactive">Inactivos (+60 días)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Estado de pagos</InputLabel>
                  <Select
                    value={filters.paymentStatus}
                    label="Estado de pagos"
                    onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="pending">Con pagos pendientes</MenuItem>
                    <MenuItem value="paid">Sin pagos pendientes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <Button
                    variant={filters.birthdaySoon ? "contained" : "outlined"}
                    size="medium"
                    onClick={() => setFilters(prev => ({ ...prev, birthdaySoon: !prev.birthdaySoon }))}
                    sx={{
                      bgcolor: filters.birthdaySoon ? BRAND_COLOR : 'transparent',
                      borderColor: BRAND_COLOR,
                      color: filters.birthdaySoon ? 'white' : BRAND_COLOR,
                      '&:hover': {
                        bgcolor: filters.birthdaySoon ? '#e57a9e' : `${BRAND_COLOR}10`,
                        borderColor: BRAND_COLOR
                      }
                    }}
                  >
                    Cumpleaños próximos
                  </Button>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} encontrado{filteredClients.length !== 1 ? 's' : ''}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Tabla de clientes */}
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
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  { label: "Cliente", align: "left" },
                  { label: "Contacto", align: "left" },
                  { label: "Última Compra", align: "left" },
                  { label: "Compras", align: "right" },
                  { label: "Acciones", align: "right" }
                ].map((header) => (
                  <TableCell 
                    key={header.label}
                    align={header.align as "left" | "right" | "center" | "justify" | "inherit"}
                    sx={{ 
                      fontWeight: 600,
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      // Fondo sólido y degradado rosado
                      bgcolor: theme.palette.mode === 'dark' 
                        ? alpha(BRAND_COLOR, 0.2)
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
              {filteredClients.length > 0 ? (
                filteredClients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <TableRow 
                      key={client.id}
                      sx={{
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' 
                            ? alpha(theme.palette.primary.main, 0.05) 
                            : alpha(BRAND_COLOR, 0.04)
                        },
                        borderLeft: client.days_since_purchase && client.days_since_purchase > 60
                          ? `3px solid ${theme.palette.warning.main}`
                          : 'none'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontWeight: 500 }}>
                              {client.name}
                            </Typography>
                            {client.birthday && (
                              <Tooltip title={`Cumpleaños: ${format(new Date(client.birthday), 'dd MMMM', { locale: es })}`}>
                                <Chip 
                                  size="small" 
                                  label={format(new Date(client.birthday), 'dd MMM', { locale: es })}
                                  sx={{ 
                                    bgcolor: alpha(BRAND_COLOR, 0.1),
                                    color: theme.palette.mode === 'dark' ? BRAND_COLOR : '#D23369',
                                    border: `1px solid ${BRAND_COLOR}30`,
                                    '& .MuiChip-label': { 
                                      fontWeight: 500,
                                      px: 1,
                                      fontSize: '0.7rem' 
                                    }
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {client.document}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{client.phone}</Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleWhatsAppClick(client.phone, client.name)}
                              sx={{ 
                                color: '#25D366',
                                padding: 0.5,
                                '&:hover': { bgcolor: 'rgba(37, 211, 102, 0.1)' }
                              }}
                              aria-label="Enviar WhatsApp"
                            >
                              <WhatsAppIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {client.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {client.last_purchase ? (
                          <Box>
                            <Typography variant="body2">
                              {format(new Date(client.last_purchase), 'dd/MM/yyyy', { locale: es })}
                            </Typography>
                            <Typography variant="caption" 
                              sx={{ 
                                color: client.days_since_purchase && client.days_since_purchase > 60 
                                  ? theme.palette.warning.main
                                  : 'text.secondary'
                              }}
                            >
                              {client.days_since_purchase === 0 
                                ? 'Hoy'
                                : client.days_since_purchase === 1
                                  ? 'Ayer'
                                  : `Hace ${client.days_since_purchase} días`
                              }
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sin compras
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack spacing={0.5} alignItems="flex-end">
                          <Typography sx={{ fontWeight: 600, color: theme.palette.mode === 'dark' ? BRAND_COLOR : '#D23369' }}>
                            ${client.total_purchases.toLocaleString()}
                          </Typography>
                          
                          {client.pending_payments > 0 && (
                            <Tooltip title="Pagos pendientes">
                              <Chip
                                icon={<AttachMoneyIcon sx={{ fontSize: '0.85rem !important', color: 'inherit' }} />}
                                label={`${client.pending_payments.toLocaleString()}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                                  color: theme.palette.warning.main,
                                  '& .MuiChip-label': { px: 0.5 }
                                }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Agendar Seguimiento">
                            <IconButton 
                              size="small"
                              onClick={() => handleScheduleFollowup(client)}
                              sx={{
                                color: alpha(BRAND_COLOR, 0.8),
                                padding: 0.75,
                                '&:hover': {
                                  bgcolor: alpha(BRAND_COLOR, 0.1)
                                }
                              }}
                              aria-label="Agendar seguimiento"
                            >
                              <CalendarMonthIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton 
                              size="small"
                              onClick={() => handleEdit(client)}
                              sx={{
                                color: theme.palette.text.secondary,
                                padding: 0.75,
                                '&:hover': {
                                  bgcolor: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.common.white, 0.1)
                                    : alpha(theme.palette.common.black, 0.05)
                                }
                              }}
                              aria-label="Editar cliente"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton 
                              size="small"
                              onClick={() => handleDelete(client.id)}
                              sx={{
                                color: alpha(theme.palette.error.main, 0.8),
                                padding: 0.75,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.1)
                                }
                              }}
                              aria-label="Eliminar cliente"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron clientes con los filtros aplicados
                    </Typography>
                    <Button 
                      variant="text"
                      size="small"
                      onClick={handleResetFilters}
                      sx={{ 
                        mt: 1,
                        color: BRAND_COLOR,
                        '&:hover': { bgcolor: `${BRAND_COLOR}10` }
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredClients.length}
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
      
      {/* Modal para agregar nuevo cliente */}
      <AddClientModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={fetchClients}
        userId={session?.user?.id || ''}
      />
      
      {/* Modal para editar cliente */}
      {selectedClient && (
        <EditClientModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={fetchClients}
          client={selectedClient}
        />
      )}
    </>
  );
}