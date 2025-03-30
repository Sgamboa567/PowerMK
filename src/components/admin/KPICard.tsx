import { Paper, Box, Typography, useTheme } from '@mui/material';

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  highlight?: 'error' | 'warning' | 'success';
}

export function KPICard({ title, value, subtitle, icon, highlight }: KPICardProps) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        background: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'white',
        border: highlight === 'error' 
          ? `1px solid ${theme.palette.error.main}` 
          : `1px solid ${theme.palette.mode === 'dark' ? 'rgba(245,218,223,0.1)' : 'rgba(245,218,223,0.3)'}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon && (
          <Box 
            sx={{ 
              mr: 2,
              color: highlight === 'error' 
                ? theme.palette.error.main 
                : '#F5DADF'
            }}
          >
            {icon}
          </Box>
        )}
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography 
        variant="h4" 
        component="div"
        sx={{ 
          color: highlight === 'error' 
            ? theme.palette.error.main 
            : theme.palette.text.primary 
        }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" mt={1}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}