'use client'
import { useState, useEffect } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AddClientModal } from './AddClientModal';

const BRAND_COLOR = '#FF90B3';

interface Sale {
  created_at: string;
  amount: number;
}

interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  birthday: string | null;
  sales?: Sale[];
  last_purchase?: string | null;
  total_purchases?: number;
}

interface FormattedClient extends Client {
  last_purchase: string | null;
  total_purchases: number;
}

interface Props {
  addOpen?: boolean;
  setAddOpen?: (open: boolean) => void;
}

export function ClientsTable({ addOpen = false, setAddOpen = () => {} }: Props) {
  const theme = useTheme();
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [clients, setClients] = useState<FormattedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [error, setError] = useState('');

  // Mover fetchClients fuera del useEffect
  const fetchClients = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          sales!sales_client_id_fkey (
            created_at,
            amount
          )
        `)
        .eq('consultant_id', session.user.id)
        .order('name');

      if (error) throw error;

      const formattedClients = data.map((client: Client): FormattedClient => {
        const sales = client.sales || [];
        return {
          ...client,
          last_purchase: sales.length > 0 
            ? [...sales].sort((a: Sale, b: Sale) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0].created_at 
            : null,
          total_purchases: sales.reduce((sum: number, sale: Sale) => sum + sale.amount, 0)
        };
      });

      setClients(formattedClients);
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
                  'Nombre',
                  'Documento',
                  'Teléfono',
                  'Email',
                  'Última Compra',
                  'Total Compras',
                  'Acciones'
                ].map((header) => (
                  <TableCell 
                    key={header}
                    align={header === 'Total Compras' || header === 'Acciones' ? 'right' : 'left'}
                    sx={{ 
                      fontWeight: 600,
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,144,179,0.1)' 
                        : 'rgba(255,144,179,0.05)'
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {clients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client) => (
                  <TableRow 
                    key={client.id}
                    sx={{
                      '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.05)' 
                          : 'rgba(255,144,179,0.05)'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {client.name}
                        {client.birthday && (
                          <Chip 
                            size="small" 
                            label={format(new Date(client.birthday), 'dd MMM', { locale: es })}
                            color="primary"
                            sx={{ 
                              bgcolor: BRAND_COLOR,
                              '& .MuiChip-label': { fontWeight: 500 }
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{client.document}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      {client.last_purchase 
                        ? format(new Date(client.last_purchase), 'dd/MM/yyyy', { locale: es })
                        : 'Sin compras'}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        sx={{ 
                          color: BRAND_COLOR,
                          fontWeight: 600 
                        }}
                      >
                        ${client.total_purchases.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="WhatsApp">
                          <IconButton 
                            size="small" 
                            onClick={() => handleWhatsAppClick(client.phone, client.name)}
                            sx={{
                              color: '#25D366',
                              '&:hover': {
                                bgcolor: 'rgba(37, 211, 102, 0.1)'
                              }
                            }}
                          >
                            <WhatsAppIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Agendar Seguimiento">
                          <IconButton 
                            size="small"
                            onClick={() => handleScheduleFollowup(client)}
                            sx={{
                              color: BRAND_COLOR,
                              '&:hover': {
                                bgcolor: `${BRAND_COLOR}15`
                              }
                            }}
                          >
                            <CalendarMonthIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small"
                            onClick={() => handleEdit(client)}
                            sx={{
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark'
                                  ? 'rgba(255,255,255,0.1)'
                                  : 'rgba(0,0,0,0.05)'
                              }
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            size="small"
                            onClick={() => handleDelete(client.id)}
                            sx={{
                              color: theme.palette.error.main,
                              '&:hover': {
                                bgcolor: theme.palette.error.main + '15'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={clients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.02)' 
              : 'transparent'
          }}
        />
      </Paper>
      
      <AddClientModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={fetchClients}
        userId={session?.user?.id || ''}
      />
    </>
  );
}