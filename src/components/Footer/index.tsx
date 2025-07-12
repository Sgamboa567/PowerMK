'use client';

import { Box, Container, Typography, Link, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';
import { motion } from 'framer-motion';
import { useState } from 'react';

// Constantes de diseño
const BRAND_COLOR = '#FF90B3'; 
const GOLD_COLOR = '#c59d5f';

// Información de enlaces y contactos
const SOCIAL_LINKS = [
  { 
    icon: <LinkedInIcon fontSize="small" />, 
    href: "https://linkedin.com/in/samuelgamboa765",
    label: "LinkedIn"
  },
  { 
    icon: <GitHubIcon fontSize="small" />, 
    href: "https://github.com/Sgamboa567",
    label: "GitHub"
  },
  { 
    icon: <InstagramIcon fontSize="small" />, 
    href: "https://www.instagram.com/samuel_gamboa765/",
    label: "Instagram"
  },
  { 
    icon: <EmailIcon fontSize="small" />, 
    href: "/contact",
    label: "Contacto"
  }
];

export const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null);

  // Animación para el contenedor del footer
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      }
    }
  };

  // Animación para los iconos sociales
  const iconVariants = {
    hover: {
      y: -5,
      scale: 1.2,
      color: BRAND_COLOR,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <Box
      component={motion.footer}
      initial="hidden"
      animate="visible"
      variants={footerVariants}
      sx={{
        width: '100%',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(to bottom, rgba(26,26,26,0), rgba(26,26,26,0.8) 40%)'
          : 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.8) 40%)',
        backdropFilter: 'blur(10px)',
        borderTop: `1px solid ${
          theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.06)'
        }`,
        py: { xs: 3, md: 4 },
        position: 'relative',
      }}
    >
      {/* Elemento decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: '-100px',
          left: '10%',
          width: '200px',
          height: '200px',
          background: `radial-gradient(circle, ${BRAND_COLOR}15 0%, transparent 70%)`,
          borderRadius: '50%',
          opacity: 0.5,
          filter: 'blur(40px)',
          display: { xs: 'none', md: 'block' }
        }}
      />

      <Container maxWidth="lg">
        {/* Logotipo del footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
            opacity: theme.palette.mode === 'dark' ? 0.9 : 0.8,
          }}
        >
          <Typography
            variant="h6"
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            sx={{
              fontWeight: 700,
              letterSpacing: '0.5px',
              fontSize: { xs: '1.2rem', sm: '1.4rem' },
              background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, ${GOLD_COLOR} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
              display: 'inline-block',
              cursor: 'pointer'
            }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            PowerMK
          </Typography>
        </Box>

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
              lineHeight: 1.7,
              maxWidth: { xs: '100%', sm: '70%' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              opacity: 0.9
            }}
          >
            © {currentYear} PowerMK. Desarrollado con{' '}
            <Box
              component={motion.span}
              animate={{ 
                scale: [1, 1.2, 1],
                color: [BRAND_COLOR, '#ff6b9d', BRAND_COLOR]
              }}
              transition={{ 
                repeat: Infinity, 
                repeatType: 'loop', 
                duration: 2,
                repeatDelay: 1
              }}
              sx={{ 
                display: 'inline-block',
                color: BRAND_COLOR
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1], color: [BRAND_COLOR, '#ff6b9d', BRAND_COLOR] }}
                transition={{ repeat: Infinity, repeatType: 'loop', duration: 2, repeatDelay: 1 }}
                sx={{ display: 'inline-block', color: BRAND_COLOR }}
              >
                ❤️
              </motion.span>
            </Box>{' '}
            por{' '}
            <Link
              href="https://github.com/sgamboa567"
              target="_blank"
              rel="noopener"
              component={motion.a}
              whileHover={{ color: GOLD_COLOR }}
              sx={{
                color: BRAND_COLOR,
                textDecoration: 'none',
                fontWeight: 500,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '0%',
                  height: '1px',
                  bottom: -1,
                  left: 0,
                  backgroundColor: GOLD_COLOR,
                  transition: 'width 0.3s ease'
                },
                '&:hover::after': {
                  width: '100%'
                }
              }}
            >
              Samuel Gamboa
            </Link>
            {' '}para{' '}
            <Link
              href="https://www.instagram.com/lina_makeupmk/"
              target="_blank"
              rel="noopener"
              component={motion.a}
              whileHover={{ color: GOLD_COLOR }}
              sx={{
                color: BRAND_COLOR,
                textDecoration: 'none',
                fontWeight: 500,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '0%',
                  height: '1px',
                  bottom: -1,
                  left: 0,
                  backgroundColor: GOLD_COLOR,
                  transition: 'width 0.3s ease'
                },
                '&:hover::after': {
                  width: '100%'
                }
              }}
            >
              Lina Uribe
            </Link>
          </Typography>

          <Box 
            sx={{ 
              display: 'flex', 
              gap: { xs: 1.5, sm: 2 },
              mt: { xs: 2, sm: 0 },
              background: theme.palette.mode === 'dark' 
                ? 'rgba(0,0,0,0.2)' 
                : 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(5px)',
              padding: '8px 16px',
              borderRadius: '20px',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(0,0,0,0.15)'
                : '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            {SOCIAL_LINKS.map((link, index) => (
              <Tooltip 
                key={index} 
                title={link.label}
                enterDelay={500}
                arrow
              >
                <IconButton
                  component={motion.a}
                  href={link.href}
                  target={link.href.startsWith('http') ? "_blank" : "_self"}
                  rel={link.href.startsWith('http') ? "noopener noreferrer" : undefined}
                  size="small"
                  variants={iconVariants}
                  initial="initial"
                  whileHover="hover"
                  onMouseEnter={() => setHoveredIcon(index)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  aria-label={link.label}
                  sx={{
                    color: hoveredIcon === index 
                      ? BRAND_COLOR 
                      : theme.palette.text.secondary,
                    width: { xs: 30, sm: 36 },
                    height: { xs: 30, sm: 36 },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {link.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Box>
        
        {/* Enlaces adicionales del footer - opcionales */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: { xs: 2, md: 4 },
            mt: 4,
            pt: 2,
            borderTop: `1px solid ${
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(0,0,0,0.05)'
            }`,
          }}
        >
          {['Términos y Condiciones', 'Política de Privacidad', 'Soporte'].map((item, index) => (
            <Link
              key={index}
              href="#"
              underline="none"
              component={motion.a}
              whileHover={{ color: BRAND_COLOR, x: 2 }}
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '0.75rem',
                opacity: 0.8,
                transition: 'all 0.2s',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              {item}
            </Link>
          ))}
        </Box>
      </Container>
    </Box>
  );
};