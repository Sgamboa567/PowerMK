import { createTheme, Theme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F5DADF',
      light: '#F8E6E9',
      dark: '#DCC4C9'
    },
    text: {
      primary: '#000000',
      secondary: '#4A4A4A'
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF'
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8
        },
        contained: {
          boxShadow: 'none'
        }
      }
    }
  }
});

export const darkTheme = createTheme({
  ...lightTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#F5DADF',
      light: 'rgba(245, 218, 223, 0.2)',
      dark: '#DCC4C9'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC'
    },
    background: {
      default: '#1A1A1A',
      paper: '#2D2D2D'
    }
  }
});