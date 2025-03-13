import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeToggle } from '@/hooks/useThemeToggle';

const Header: React.FC = () => {
    const theme = useTheme();
    const { toggleTheme } = useThemeToggle();

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
                    {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

export default Header;