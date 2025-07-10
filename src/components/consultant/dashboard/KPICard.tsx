import { Box, Paper, Typography, Chip, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface KPICardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  change?: number;
  badge?: string;
  highlight?: 'success' | 'warning' | 'error';
  clickable?: boolean;
  onClick?: () => void;
}

export function KPICard({ 
  title, 
  value, 
  icon, 
  change, 
  badge,
  highlight,
  clickable = false,
  onClick
}: KPICardProps) {
  const theme = useTheme();
  
  const getHighlightColor = () => {
    if (!highlight) return '';
    
    switch(highlight) {
      case 'success':
        return theme.palette.success.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return '';
    }
  };
  
  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark' 
          ? 'rgba(26,26,26,0.9)' 
          : 'rgba(255,255,255,0.9)',
        border: `1px solid ${getHighlightColor() || (theme.palette.mode === 'dark' 
          ? 'rgba(255,144,179,0.1)' 
          : 'rgba(255,144,179,0.2)')}`,
        borderLeft: getHighlightColor() ? `4px solid ${getHighlightColor()}` : undefined,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
        '&:hover': clickable ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        } : {}
      }}
      onClick={clickable && onClick ? onClick : undefined}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          
          {change !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {change >= 0 ? (
                <TrendingUpIcon fontSize="small" color="success" />
              ) : (
                <TrendingDownIcon fontSize="small" color="error" />
              )}
              <Typography 
                variant="body2" 
                color={change >= 0 ? 'success.main' : 'error.main'} 
                sx={{ ml: 0.5, fontWeight: 500 }}
              >
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </Typography>
            </Box>
          )}
          
          {badge && (
            <Chip 
              size="small" 
              label={badge} 
              sx={{ 
                mt: 1, 
                backgroundColor: 'rgba(255,144,179,0.1)', 
                color: '#FF90B3',
                fontWeight: 500 
              }} 
            />
          )}
        </Box>
        
        {icon && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: '50%',
              bgcolor: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(255,144,179,0.1)',
              color: '#FF90B3',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
    </Paper>
  );
}