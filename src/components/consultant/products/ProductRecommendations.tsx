'use client'
import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  useTheme,
  CircularProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const BRAND_COLOR = '#FF90B3';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  category: string;
  isNew?: boolean;
  isTrending?: boolean;
  isPromo?: boolean;
}

export function ProductRecommendations() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);

        // Obtener productos más vendidos
        const { data: topSellers, error: topSellersError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            image_url,
            stock,
            category,
            created_at
          `)
          .eq('consultant_id', session.user.id)
          .order('sales_count', { ascending: false })
          .limit(6);

        if (topSellersError) throw topSellersError;

        // Procesar y marcar productos
        const processedProducts = topSellers?.map(product => ({
          ...product,
          isNew: new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          isTrending: Math.random() > 0.5, // Ejemplo - implementar lógica real
          isPromo: Math.random() > 0.7 // Ejemplo - implementar lógica real
        }));

        setRecommendations(processedProducts || []);

      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('No se pudieron cargar las recomendaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
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
      <Typography variant="h6" sx={{ mb: 3 }}>
        Productos Recomendados
      </Typography>

      <Grid container spacing={2}>
        {recommendations.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image_url || '/placeholder.png'}
                  alt={product.name}
                  sx={{ objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    display: 'flex',
                    gap: 0.5,
                    flexWrap: 'wrap'
                  }}
                >
                  {product.isNew && (
                    <Chip
                      size="small"
                      icon={<NewReleasesIcon />}
                      label="Nuevo"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white'
                      }}
                    />
                  )}
                  {product.isTrending && (
                    <Chip
                      size="small"
                      icon={<TrendingUpIcon />}
                      label="Tendencia"
                      sx={{
                        bgcolor: BRAND_COLOR,
                        color: 'white'
                      }}
                    />
                  )}
                  {product.isPromo && (
                    <Chip
                      size="small"
                      icon={<LocalOfferIcon />}
                      label="Oferta"
                      sx={{
                        bgcolor: 'error.main',
                        color: 'white'
                      }}
                    />
                  )}
                </Box>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {product.category}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    ${product.price.toLocaleString()}
                  </Typography>
                  <Tooltip title="Agregar a pedido">
                    <IconButton
                      size="small"
                      sx={{
                        color: BRAND_COLOR,
                        '&:hover': {
                          bgcolor: `${BRAND_COLOR}15`
                        }
                      }}
                    >
                      <AddShoppingCartIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}