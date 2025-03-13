import React, { useEffect, useState } from 'react';
import { Switch } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const handleToggle = () => {
    setIsDarkMode((prev) => !prev);
    const newTheme = !isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  return (
    <Switch
      checked={isDarkMode}
      onChange={handleToggle}
      color="primary"
      inputProps={{ 'aria-label': 'toggle theme' }}
    />
  );
};

export default ThemeToggle;