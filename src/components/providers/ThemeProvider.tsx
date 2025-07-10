'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { lightTheme, darkTheme } from '@/styles/theme';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof lightTheme | typeof darkTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system' 
}: ThemeProviderProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Intentar obtener el tema guardado del localStorage si estamos en el cliente
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
    }
    // Si no hay tema guardado, usar el valor por defecto
    return defaultTheme === 'system' ? prefersDarkMode : defaultTheme === 'dark';
  });

  // Efecto para aplicar el tema inmediatamente
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  // Efecto para la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Función mejorada para cambiar el tema
  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  }, []);

  // Valor del contexto memoizado
  const contextValue = useMemo<ThemeContextType>(() => ({
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? darkTheme : lightTheme
  }), [isDarkMode, toggleTheme]);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}

// Hook personalizado para obtener el tema actual
export function useTheme() {
  const { theme } = useThemeContext();
  return theme;
}

// Hook personalizado para el estado del tema oscuro
export function useDarkMode() {
  const { isDarkMode, toggleTheme } = useThemeContext();
  return { isDarkMode, toggleTheme };
}