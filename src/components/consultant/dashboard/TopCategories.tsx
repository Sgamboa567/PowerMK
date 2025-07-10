'use client'
import { Box, Paper, Typography, useTheme, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import CategoryIcon from '@mui/icons-material/Category';

const BRAND_COLOR = '#FF90B3';
const COLORS = ['#FF90B3', '#FFB6C1', '#FFC0CB', '#FFE4E1', '#FFF0F5'];

interface CategorySale {
  name: string;
  value: number;
  percentage: number;
}

export function TopCategories() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<CategorySale[]>([]);

  useEffect(() => {
    const fetchCategorySales = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('sales_products')
          .select(`
            quantity,
            amount,
            products:fk_sale_products_product (
              category
            )
          `)
          .eq('consultant_id', session.user.id);

        if (error) throw error;

        // Procesar datos por categoría
        const categoryTotals = data.reduce((acc: { [key: string]: number }, item) => {
          const category = item.products?.category || 'Sin categoría';
          acc[category] = (acc[category] || 0) + (item.amount || 0);
          return acc;
        }, {});

        // Calcular total de ventas
        const totalSales = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

        // Formatear datos para el gráfico
        const formattedData = Object.entries(categoryTotals)
          .map(([name, value]) => ({
            name,
            value,
            percentage: Math.round((value / totalSales) * 100)
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setCategories(formattedData);

      } catch (error) {
        console.error('Error fetching category sales:', error);
        setError('No se pudieron cargar las categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchCategorySales();
  }, [session]);

  if (loading) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: BRAND_COLOR }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <CategoryIcon sx={{ color: BRAND_COLOR }} />
        Categorías Top
      </Typography>

      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {categories.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${BRAND_COLOR}`,
                borderRadius: '8px'
              }}
            />
            <Legend 
              formatter={(value) => {
                const category = categories.find(c => c.name === value);
                return `${value} (${category?.percentage}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}