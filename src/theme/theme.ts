import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F5DADF',
    },
    text: {
      primary: '#000000',
      secondary: '#4A4A4A',
    },
    background: {
      default: '#ffffff',
      paper: 'rgba(255,255,255,0.9)',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F5DADF',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#E0E0E0',
    },
    background: {
      default: '#1A1A1A',
      paper: 'rgba(26,26,26,0.9)',
    },
  },
});