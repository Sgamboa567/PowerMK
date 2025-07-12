import { useThemeContext } from '@/components/providers/ThemeProvider';

export const useThemeToggle = () => {
  const context = useThemeContext();
  
  if (!context) {
    throw new Error('useThemeToggle must be used within a ThemeProvider');
  }

  return context;
};