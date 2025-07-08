'use client'
import { Paper, Typography, Box } from '@mui/material';
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

const BRAND_COLOR = '#FF90B3';

export function KPICard({ title, value, change, badge, highlight, icon }: KPICardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: theme => `1px solid ${theme.palette.divider}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          {icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: BRAND_COLOR + '15',
                color: BRAND_COLOR
              }}
            >
              {icon}
            </Box>
          )}
          <Typography variant="subtitle1" color="text.secondary">
            {title}
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          {value}
        </Typography>

        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {change >= 0 ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />}
            <Typography
              variant="body2"
              color={change >= 0 ? 'success.main' : 'error.main'}
            >
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </Typography>
          </Box>
        )}

        {badge && (
          <Box
            sx={{
              mt: 1,
              display: 'inline-block',
              px: 1,
              py: 0.5,
              bgcolor: BRAND_COLOR,
              borderRadius: 1,
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          >
            {badge}
          </Box>
        )}
      </Box>

      {/* Decorative background */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          bgcolor: BRAND_COLOR + '10',
          opacity: 0.5
        }}
      />
    </Paper>
  );
}