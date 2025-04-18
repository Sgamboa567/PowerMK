import { createContext, FC, ReactNode, useEffect, useState, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '@/styles/theme';
import { CssBaseline } from '@mui/material';

interface ThemeContextType {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Add this custom hook after your ThemeContext creation
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ toggleTheme, isDarkMode }}>
      <MuiThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};