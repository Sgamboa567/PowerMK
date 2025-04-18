'use client';

import { Box, Container, Typography, Link, IconButton, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';

const BRAND_COLOR = '#FF90B3'; // Define the brand color here

export const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        background: theme.palette.mode === 'dark'
          ? 'rgba(26,26,26,0.8)'
          : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        borderTop: `1px solid ${
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(0,0,0,0.1)'
        }`,
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            © {currentYear} PowerMK. Desarrollado con ❤️ por{' '}
            <Link
              href="https://github.com/sgamboa567"
              target="_blank"
              rel="noopener"
              sx={{
                color: BRAND_COLOR,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Samuel Gamboa
            </Link>
            {' '}para{' '}
            <Link
              href="https://www.instagram.com/lina_makeupmk/"
              target="_blank"
              rel="noopener"
              sx={{
                color: BRAND_COLOR,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Lina Uribe
            </Link>
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              href="https://linkedin.com/in/samuelgamboa765"
              target="_blank"
              rel="noopener"
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: BRAND_COLOR,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <LinkedInIcon fontSize="small" />
            </IconButton>
            <IconButton
              href="https://github.com/Sgamboa567"
              target="_blank"
              rel="noopener"
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: BRAND_COLOR,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <GitHubIcon fontSize="small" />
            </IconButton>
            <IconButton
              href="https://www.instagram.com/samuel_gamboa765/"
              target="_blank"
              rel="noopener"
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: BRAND_COLOR,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <InstagramIcon fontSize="small" />
            </IconButton>
            <IconButton
              href="/contact"
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: BRAND_COLOR,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <EmailIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};