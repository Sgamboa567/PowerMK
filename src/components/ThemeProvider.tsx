'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { ThemeProvider as MUIThemeProvider, keyframes } from '@mui/material';
import { Box, GlobalStyles } from '@mui/material';
import { lightTheme, darkTheme } from '@/theme/theme';

// Define animations solo una vez, fuera del componente
const circleInHesitate = keyframes`
  0% { clip-path: circle(0% at var(--mouse-x) var(--mouse-y)); }
  40% { clip-path: circle(40% at var(--mouse-x) var(--mouse-y)); }
  100% { clip-path: circle(150% at var(--mouse-x) var(--mouse-y)); }
`;

const circleOutHesitate = keyframes`
  0% { clip-path: circle(150% at var(--mouse-x) var(--mouse-y)); }
  40% { clip-path: circle(40% at var(--mouse-x) var(--mouse-y)); }
  100% { clip-path: circle(0% at var(--mouse-x) var(--mouse-y)); }
`;

// Crear tipo para el contexto
type ThemeContextType = {
  toggleTheme: (e?: React.MouseEvent) => void;
  isDarkMode: boolean;
};

// Valor por defecto del contexto
const defaultContext: ThemeContextType = {
  toggleTheme: () => {},
  isDarkMode: false,
};

const ThemeContext = createContext<ThemeContextType>(defaultContext);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Reducir el número de estados
  const [state, setState] = useState({
    isDarkMode: false,
    isAnimating: false,
    animationType: null as null | 'toDark' | 'toLight',
    visualTheme: 'light' as 'light' | 'dark',
    mounted: false
  });
  
  // Descomponer el estado para legibilidad
  const { isDarkMode, isAnimating, animationType, visualTheme, mounted } = state;
  
  // Usar useCallback para evitar recreaciones innecesarias de esta función
  const toggleTheme = useCallback((event?: React.MouseEvent) => {
    if (state.isAnimating) return; // Evitar múltiples animaciones
    
    // Posición del evento
    if (event) {
      const x = `${(event.clientX / window.innerWidth) * 100}%`;
      const y = `${(event.clientY / window.innerHeight) * 100}%`;
      document.documentElement.style.setProperty('--mouse-x', x);
      document.documentElement.style.setProperty('--mouse-y', y);
    } else {
      document.documentElement.style.setProperty('--mouse-x', '90%');
      document.documentElement.style.setProperty('--mouse-y', '10%');
    }

    const newIsDarkMode = !state.isDarkMode;
    
    // Actualizar estado una sola vez
    setState(prev => ({
      ...prev,
      isDarkMode: newIsDarkMode,
      isAnimating: true,
      animationType: newIsDarkMode ? 'toDark' : 'toLight'
    }));
    
    // Persistir tema en localStorage
    localStorage.setItem('theme', newIsDarkMode ? 'dark' : 'light');

    // Optimizar la animación con requestAnimationFrame
    let animationFrameId: number;
    const startTime = performance.now();
    const totalDuration = 2500;
    const visualChangeDelay = totalDuration * 0.2;
    const visualChangeDuration = totalDuration * 0.6;
    
    const animateTheme = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      
      if (elapsed < visualChangeDelay) {
        animationFrameId = requestAnimationFrame(animateTheme);
      } else if (elapsed < visualChangeDelay + visualChangeDuration) {
        const progress = (elapsed - visualChangeDelay) / visualChangeDuration;
        const opacityValue = newIsDarkMode ? progress : (1 - progress);
        
        // Actualizar solo la CSS variable necesaria
        document.documentElement.style.setProperty('--theme-bg-opacity', opacityValue.toString());
        animationFrameId = requestAnimationFrame(animateTheme);
      } else {
        // Completar cambio de tema
        setState(prev => ({
          ...prev,
          visualTheme: newIsDarkMode ? 'dark' : 'light'
        }));
        
        document.documentElement.style.setProperty('--theme-bg-opacity', '1');
        
        if (elapsed >= totalDuration) {
          // Finalizar animación
          setState(prev => ({
            ...prev,
            isAnimating: false,
            animationType: null
          }));
        } else {
          animationFrameId = requestAnimationFrame(animateTheme);
        }
      }
    };
    
    animationFrameId = requestAnimationFrame(animateTheme);
    
    // Limpiar animación si el componente se desmonta
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [state.isAnimating, state.isDarkMode]);
  
  // Efectos iniciales
  useEffect(() => {
    // Inicializar tema una sola vez
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    const isDark = savedTheme === 'dark';
    
    // Posición inicial para la animación
    document.documentElement.style.setProperty('--mouse-x', '90%');
    document.documentElement.style.setProperty('--mouse-y', '10%');
    
    // Actualizar estado una sola vez
    setState({
      isDarkMode: isDark,
      isAnimating: false,
      animationType: null,
      visualTheme: isDark ? 'dark' : 'light',
      mounted: true
    });
    
    // Solo un valor CSS para la opacidad del tema
    document.documentElement.style.setProperty('--theme-bg-opacity', isDark ? '1' : '0');
  }, []);
  
  // Memoizar los estilos globales para evitar recrearlos en cada renderizado
  const globalStyles = useMemo(() => ({
    ':root': {
      '--theme-bg-light': '#ffffff',
      '--theme-bg-dark': '#1A1A1A',
      '--theme-text-light': '#000000',
      '--theme-text-dark': '#ffffff',
      '--theme-bg-opacity': visualTheme === 'dark' ? '1' : '0',
      '--theme-card-bg': visualTheme === 'dark' ? '#252525' : '#ffffff',
      '--theme-border': visualTheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      '--theme-shadow': visualTheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
    },
    'body': {
      backgroundColor: visualTheme === 'dark' ? 'var(--theme-bg-dark)' : 'var(--theme-bg-light)',
      color: visualTheme === 'dark' ? 'var(--theme-text-dark)' : 'var(--theme-text-light)',
      transition: isAnimating ? 'none' : 'background-color 0.5s ease, color 0.5s ease',
    },
    '.MuiPaper-root': {
      transition: isAnimating ? 'none' : 'background-color 0.5s ease, box-shadow 0.5s ease, border 0.5s ease',
    },
    '.MuiTypography-root': {
      transition: isAnimating ? 'none' : 'color 0.5s ease',
    },
    '.MuiButton-root, .MuiIconButton-root': {
      transition: isAnimating ? 'none' : 'all 0.5s ease',
    },
  }), [visualTheme, isAnimating]);
  
  // Memoizar el valor del contexto
  const contextValue = useMemo(() => ({ 
    toggleTheme, 
    isDarkMode 
  }), [toggleTheme, isDarkMode]);
  
  // No renderizar en SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={visualTheme === 'dark' ? darkTheme : lightTheme}>
        <GlobalStyles styles={globalStyles} />
        
        {isAnimating && (
          <>
            {/* Capa base - solo renderizada cuando es necesario */}
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 9996,
                backgroundColor: animationType === 'toDark' ? '#1A1A1A' : '#ffffff',
                opacity: 0,
                animation: 'fadeIn 2.5s forwards',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0 },
                  '30%': { opacity: 0 },
                  '100%': { opacity: 0.3 },
                },
                pointerEvents: 'none',
                willChange: 'opacity', // Optimización GPU
              }}
            />

            {/* Animación principal del círculo */}
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 9997,
                background: animationType === 'toDark' 
                  ? `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(26,26,26,0.92), rgba(26,26,26,0.85))`
                  : `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.92), rgba(255,255,255,0.85))`,
                animation: animationType === 'toDark'
                  ? `${circleInHesitate} 2.5s cubic-bezier(.25, 1, .30, 1) both`
                  : `${circleOutHesitate} 2.5s cubic-bezier(.25, 1, .30, 1) both`,
                willChange: 'clip-path', // Optimización GPU
                pointerEvents: 'none',
              }}
            />
            
            {/* Capa de color sutil - simplificada */}
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 9995,
                backgroundColor: animationType === 'toDark' ? '#1A1A1A' : '#ffffff',
                opacity: 0.15,
                mixBlendMode: 'color-burn',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
        
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}