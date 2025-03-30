import { Box, Typography, CircularProgress } from '@mui/material';

export function GoalProgress() {
  return (
    <Box>
      <Typography variant="h6">Progreso de Meta</Typography>
      <Box display="flex" justifyContent="center" alignItems="center" height={200}>
        <CircularProgress variant="determinate" value={75} />
      </Box>
    </Box>
  );
}