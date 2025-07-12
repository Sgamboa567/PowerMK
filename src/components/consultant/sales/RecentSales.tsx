'use client'
import { Box, Paper, Typography, List, ListItem, ListItemText, Avatar, Chip, useTheme, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const BRAND_COLOR = '#FF90B3';

interface Sale {
  id: string;
  created_at: string;
  amount: number;
  client: {
    id: string;
    name: string;
  };
  products: {
    id: string;
    name: string;
    quantity: number;
  }[];
}

export function RecentSales() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  useEffect(() => {
    const fetchRecentSales = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('sales')
          .select(`
            id,
            created_at,
            amount,
            client:clients!sales_client_id_fkey (
              id,
              name
            ),
            products:sales_products (
              id,
              name:products!sales_products_product_id_fkey(name),
              quantity
            )
          `)
          .eq('consultant_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        
        // Transformar los datos para que coincidan con la interfaz Sale
        const formattedSales = data?.map(sale => ({
          id: sale.id,
          created_at: sale.created_at,
          amount: sale.amount,
          client: {
            id: Array.isArray(sale.client) && sale.client.length > 0 
              ? sale.client[0].id 
              : '',
            name: Array.isArray(sale.client) && sale.client.length > 0 
              ? sale.client[0].name 
              : 'Cliente'
          },
          products: Array.isArray(sale.products) 
            ? sale.products.map(product => ({
                id: product.id,
                name: Array.isArray(product.name) && product.name.length > 0 
                  ? product.name[0].name 
                  : 'Producto',
                quantity: product.quantity
              }))
            : []
        })) || [];
        
        setRecentSales(formattedSales);

      } catch (error) {
        console.error('Error fetching recent sales:', error);
        setError('No se pudieron cargar las ventas recientes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSales();
  }, [session]);

  if (loading) {
    return (
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark'
          ? 'rgba(26,26,26,0.9)'
          : 'rgba(255,255,255,0.9)',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(255,144,179,0.1)'
          : '1px solid rgba(255,144,179,0.2)'
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <ShoppingBagIcon sx={{ color: BRAND_COLOR }} />
        Ventas Recientes
      </Typography>

      <List>
        {recentSales.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No hay ventas recientes
          </Typography>
        ) : (
          recentSales.map(sale => (
            <ListItem
              key={sale.id}
              sx={{
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.02)',
                borderRadius: 1,
                mb: 1,
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: BRAND_COLOR,
                    width: 40,
                    height: 40,
                    mr: 2
                  }}
                >
                  {sale.client.name.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">
                    {sale.client.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(sale.created_at), "d 'de' MMMM, HH:mm", { locale: es })}
                  </Typography>
                </Box>
                <Chip
                  label={`$${sale.amount.toLocaleString()}`}
                  sx={{
                    bgcolor: BRAND_COLOR,
                    color: 'white',
                    fontWeight: 500
                  }}
                />
              </Box>
              <Box sx={{ pl: 7, width: '100%' }}>
                <Typography variant="caption" color="text.secondary">
                  {sale.products.map(p => p.name).join(', ')}
                </Typography>
              </Box>
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}