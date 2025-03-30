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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useTheme } from '@mui/material/styles';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
}

export function ClientsTable() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('clients')
            .select(`
              *,
              sales (
                created_at,
                amount
              )
            `)
            .eq('consultant_id', session.user.id)
            .order('name');

          if (error) throw error;

          const formattedClients = data.map((client: Client) => ({
            ...client,
            last_purchase: client.sales?.length > 0 
              ? client.sales.sort((a: Sale, b: Sale) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )[0].created_at 
              : null,
            total_purchases: client.sales?.reduce((sum: number, sale: Sale) => sum + sale.amount, 0) || 0
          }));

          setClients(formattedClients);
        } catch (error) {
          console.error('Error fetching clients:', error);
        } finally {
          setLoading(false);
        }
      }
    };

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

  if (loading) {
    return <Typography>Cargando clientes...</Typography>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Última Compra</TableCell>
              <TableCell align="right">Total Compras</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    {client.name}
                    {client.birthday && (
                      <Chip 
                        size="small" 
                        label={format(new Date(client.birthday), 'dd MMM', { locale: es })}
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{client.document}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    {client.last_purchase 
                      ? format(new Date(client.last_purchase), 'dd/MM/yyyy', { locale: es })
                      : 'Sin compras'}
                  </TableCell>
                  <TableCell align="right">
                    ${client.total_purchases.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="WhatsApp">
                      <IconButton 
                        size="small" 
                        color="success"
                        onClick={() => handleWhatsAppClick(client.phone, client.name)}
                      >
                        <WhatsAppIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Agendar Seguimiento">
                      <IconButton size="small" color="primary">
                        <CalendarMonthIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
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
      />
    </Paper>
  );
}