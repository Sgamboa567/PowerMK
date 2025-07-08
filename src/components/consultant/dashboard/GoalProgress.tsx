'use client'
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/supabase';

const BRAND_COLOR = '#FF90B3';

export function GoalProgress() {
  const theme = useTheme();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState({
    current: 0,
    target: 0,
    percentage: 0
  });

  useEffect(() => {
    const fetchGoalData = async () => {
      if (!session?.user?.id) return;

      try {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Obtener meta mensual
        const { data: goalData } = await supabase
          .from('goals')
          .select('amount')
          .eq('user_id', session.user.id)
          .single();

        // Obtener ventas del mes
        const { data: salesData } = await supabase
          .from('sales')
          .select('amount')
          .eq('user_id', session.user.id)
          .gte('created_at', firstDayOfMonth.toISOString())
          .lte('created_at', lastDayOfMonth.toISOString());

        const targetAmount = goalData?.amount || 0;
        const currentAmount = salesData?.reduce((sum, sale) => sum + sale.amount, 0) || 0;
        const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;

        setGoal({
          current: currentAmount,
          target: targetAmount,
          percentage
        });
      } catch (error) {
        console.error('Error fetching goal data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoalData();
  }, [session]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        Cargando...
      </Box>
    );
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
        Progreso de Meta
      </Typography>

      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          justifyContent: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress
            variant="determinate"
            value={goal.percentage}
            size={160}
            thickness={4}
            sx={{
              color: BRAND_COLOR,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
                transition: 'stroke-dashoffset 0.5s ease 0s'
              }
            }}
          />
        </motion.div>
        
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <Typography variant="h4" component="div" color="text.primary" fontWeight="600">
            {Math.round(goal.percentage)}%
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}