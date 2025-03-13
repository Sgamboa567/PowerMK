import { useContext } from 'react';
import { ThemeContext } from '@/components/providers/ThemeProvider';

export const useThemeToggle = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useThemeToggle must be used within a ThemeProvider');
  }

  return context;
};