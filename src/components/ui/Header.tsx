import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext } from '@/components/providers/ThemeProvider';

const Header: React.FC = () => {
    const { theme, isDarkMode, toggleTheme } = useThemeContext();

    return (
        <AppBar 
            position="sticky" 
            elevation={0}
            sx={{ 
                backgroundColor: theme.palette.background.paper,
                borderBottom: `1px solid ${theme.palette.divider}`
            }}
        >
            <Toolbar>
                <Typography 
                    variant="h6" 
                    color="textPrimary" 
                    sx={{ flexGrow: 1 }}
                >
                    PowerMK
                </Typography>
                <IconButton onClick={toggleTheme} color="inherit">
                    {isDarkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;