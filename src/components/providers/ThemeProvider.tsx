import { createContext, FC, ReactNode, useEffect, useState, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '@/styles/theme';
import { CssBaseline, Box, keyframes } from '@mui/material';

// Define animations
const circleInHesitate = keyframes`
  0% {
    clip-path: circle(0%);
  }
  40% {
    clip-path: circle(40%);
  }
  100% {
    clip-path: circle(125%);
  }
`;

const circleOutHesitate = keyframes`
  0% {
    clip-path: circle(125%);
  }
  40% {
    clip-path: circle(40%);
  }
  100% {
    clip-path: circle(0%);
  }
`;

interface ThemeContextType {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'toDark' | 'toLight' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    setIsAnimating(true);
    setAnimationType(isDarkMode ? 'toLight' : 'toDark');
    
    // Pequeño retraso para iniciar la animación antes de cambiar el tema
    setTimeout(() => {
      const newTheme = !isDarkMode ? 'dark' : 'light';
      setIsDarkMode(!isDarkMode);
      localStorage.setItem('theme', newTheme);
      
      // Finaliza la animación después de que se complete
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationType(null);
      }, 2500);
    }, 100);
  };

  // No renderiza nada durante SSR para evitar errores de hidratación
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ toggleTheme, isDarkMode }}>
      <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        {isAnimating && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 9999,
              backgroundColor: animationType === 'toDark' ? '#1A1A1A' : '#ffffff',
              animation: animationType === 'toDark'
                ? `${circleInHesitate} 2.5s cubic-bezier(.25, 1, .30, 1) both`
                : `${circleOutHesitate} 2.5s cubic-bezier(.25, 1, .30, 1) both`,
              pointerEvents: 'none',
            }}
          />
        )}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};