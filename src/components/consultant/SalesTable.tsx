'use client'
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '@mui/material/styles';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

interface Product {
  name: string;
}

interface SaleProduct {
  product_id: string;
  quantity: number;
  price_at_sale: number;
  products: Product;
}

interface Client {
  name: string;
}

interface RawSale {
  id: string;
  amount: number;
  created_at: string;
  clients: Client;
  sale_products: SaleProduct[];
}

interface FormattedSale {
  id: string;
  client_name: string;
  amount: number;
  created_at: string;
  products: string[];
}

export function SalesTable() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sales, setSales] = useState<FormattedSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('sales')
            .select(`
              id,
              amount,
              created_at,
              clients (
                name
              ),
              sale_products (
                quantity,
                price_at_sale,
                products (
                  name
                )
              )
            `)
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const formattedSales: FormattedSale[] = data?.map((sale: any) => ({
            id: sale.id,
            client_name: sale.clients?.name || 'Cliente no registrado',
            amount: sale.amount,
            created_at: sale.created_at,
            products: sale.sale_products?.map((sp: any) => 
              `${sp.products.name} (${sp.quantity} x $${sp.price_at_sale.toLocaleString()})`
            ) || []
          })) || [];

          setSales(formattedSales);
        } catch (error) {
          console.error('Error fetching sales:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSales();
  }, [session]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return <Typography>Cargando ventas...</Typography>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Productos</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {format(new Date(sale.created_at), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>{sale.client_name}</TableCell>
                  <TableCell>{sale.products.join(', ')}</TableCell>
                  <TableCell align="right">
                    ${sale.amount.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error">
                        <DeleteIcon />
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
        count={sales.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página"
      />
    </Paper>
  );
}