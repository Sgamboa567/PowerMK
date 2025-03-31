'use client'
import { Box, CircularProgress, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';
import { styled } from '@mui/material/styles';

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const LoadingContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(245,218,223,0.05) 100%)'
    : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,218,223,0.2) 100%)',
  zIndex: 9999,
  animation: `${fadeIn} 0.3s ease-in-out`,
}));

const SpinnerWrapper = styled(Box)({
  position: 'relative',
  animation: `${pulse} 2s infinite ease-in-out`,
});

export function LoadingScreen({ message = 'Cargando...' }: { message?: string }) {
  return (
    <LoadingContainer>
      <SpinnerWrapper>
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#F5DADF',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
      </SpinnerWrapper>
      <Typography
        variant="h6"
        sx={{
          mt: 2,
          fontWeight: 500,
          animation: `${fadeIn} 0.5s ease-in-out`,
        }}
      >
        {message}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: 'text.secondary',
          animation: `${fadeIn} 0.7s ease-in-out`,
        }}
      >
        PowerMK
      </Typography>
    </LoadingContainer>
  );
}