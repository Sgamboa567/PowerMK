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
import AddCircleIcon from '@mui/icons-material/AddCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { useTheme } from '@mui/material/styles';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

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

interface SupabaseInventoryResponse {
  id: string;
  quantity: number;
  product: {
    name: string;
    sku: string;
    price: number;
    min_stock: number;
  };
}

export function InventoryTable() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('inventory')
            .select(`
              id,
              quantity,
              product:products (
                name,
                sku,
                price,
                min_stock
              )
            `)
            .eq('user_id', session.user.id)
            .order('id');

          if (error) throw error;

          const formattedData: InventoryItem[] = (data as SupabaseInventoryResponse[]).map(item => ({
            id: item.id,
            quantity: item.quantity,
            product: {
              name: item.product.name,
              sku: item.product.sku,
              price: item.product.price,
              min_stock: item.product.min_stock
            }
          }));

          setInventory(formattedData);
        } catch (error) {
          console.error('Error fetching inventory:', error);
        } finally {
          setLoading(false);
        }
      }
    };

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
    return <Typography>Cargando inventario...</Typography>;
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>SKU</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.sku}</TableCell>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell align="right">
                    ${item.product.price.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell>
                    {item.quantity <= item.product.min_stock ? (
                      <Chip
                        icon={<WarningIcon />}
                        label="Stock Bajo"
                        color="warning"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="En Stock"
                        color="success"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar Stock">
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reponer">
                      <IconButton size="small" color="primary">
                        <AddCircleIcon />
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
        count={inventory.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página"
      />
    </Paper>
  );
}