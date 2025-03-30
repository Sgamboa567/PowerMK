'use client'
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  badge?: string;
  highlight?: 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

export function KPICard({ title, value, change, badge, highlight, icon }: KPICardProps) {
  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: '0px 8px 16px rgba(245, 218, 223, 0.3)'
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
          {icon}
        </Box>
        
        <Typography variant="h4" gutterBottom>
          {value}
        </Typography>
        
        {change !== undefined && (
          <Box display="flex" alignItems="center">
            {change >= 0 ? 
              <TrendingUpIcon color="success" /> : 
              <TrendingDownIcon color="error" />
            }
            <Typography 
              variant="body2" 
              color={change >= 0 ? 'success.main' : 'error.main'}
              ml={1}
            >
              {Math.abs(change).toFixed(1)}%
            </Typography>
          </Box>
        )}
        
        {badge && (
          <Chip 
            label={badge} 
            color="warning" 
            size="small" 
            sx={{ mt: 1 }} 
          />
        )}
      </CardContent>
    </Card>
  );
}