'use client';

import { Box, Button, Container, Typography, useMediaQuery } from '@mui/material';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { keyframes } from '@mui/system';

const glowAnimation = keyframes`
  0% { opacity: 0.4 }
  50% { opacity: 0.7 }
  100% { opacity: 0.4 }
`;

const slides = [
  {
    title: 'Bienvenido/a a PowerMK',
    subtitle: 'Tu plataforma integral de gestión Mary Kay',
    color: '#FF90B3'
  },
  {
    title: 'Gestiona tu Negocio',
    subtitle: 'Controla inventario, ventas, calendario y clientes en un solo lugar',
    color: '#FF7AA2'
  },
  {
    title: 'Impulsa tu Éxito',
    subtitle: 'Herramientas diseñadas para el modelo de negocios Mary Kay',
    color: '#FF6691'
  }
];

const handleNavigation = (session: any) => {
  if (!session) {
    return '/login';
  }

  // Check user role and redirect accordingly
  switch (session.user.role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'CONSULTANT':
      return '/consultant/dashboard';
    case 'DIRECTOR':
      return '/director/dashboard';
    default:
      return '/dashboard';
  }
};

export const HeroBanner = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentSlide, setCurrentSlide] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const cursorY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(26,26,26,0.98) 0%, rgba(26,26,26,1) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(245,218,223,0.1) 100%)',
      }}
    >
      {/* Modern geometric background */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: theme.palette.mode === 'dark' ? 0.5 : 0.8 }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${slides[currentSlide].color}15, ${slides[currentSlide].color}05)`
                : `linear-gradient(135deg, ${slides[currentSlide].color}30, ${slides[currentSlide].color}10)`,
              clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
              width: isMobile ? '150%' : '100%',
              height: isMobile ? '50%' : '100%',
              top: `${i * 33}%`,
              left: `${i * -15}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          />
        ))}
      </Box>

      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Box 
              sx={{ 
                maxWidth: { xs: '95%', sm: '800px' }, 
                margin: '0 auto',
                px: { xs: 2, sm: 4 }
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '3rem', md: '4.5rem' },
                  fontWeight: 800,
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${slides[currentSlide].color} 0%, #F5DADF 100%)`
                    : `linear-gradient(135deg, ${slides[currentSlide].color} 0%, #FF1493 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: { xs: 2, sm: 3 },
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  filter: theme.palette.mode === 'dark' ? 'none' : 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))',
                }}
              >
                {slides[currentSlide].title}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  color: theme.palette.mode === 'dark' ? '#F5DADF' : '#666',
                  fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                  fontWeight: 500,
                  mb: { xs: 3, sm: 5 },
                  opacity: 0.9,
                  letterSpacing: '0.02em',
                  maxWidth: '90%',
                  margin: '0 auto',
                }}
              >
                {slides[currentSlide].subtitle}
              </Typography>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push(handleNavigation(session))}
                    sx={{
                      bgcolor: slides[currentSlide].color,
                      backdropFilter: 'blur(10px)',
                      color: 'white',
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 3, sm: 4 },
                      borderRadius: '8px',
                      textTransform: 'none',
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        bgcolor: slides[currentSlide].color,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 40px ${slides[currentSlide].color}40`,
                      },
                    }}
                    endIcon={
                      <ArrowForwardIcon sx={{ transition: 'transform 0.3s ease' }} />
                    }
                  >
                    Comenzar ahora
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/about')}
                    sx={{
                      borderColor: slides[currentSlide].color,
                      color: theme.palette.mode === 'dark' ? '#F5DADF' : '#666',
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 3, sm: 4 },
                      borderRadius: '8px',
                      textTransform: 'none',
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        borderColor: slides[currentSlide].color,
                        bgcolor: 'transparent',
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 40px ${slides[currentSlide].color}20`,
                      },
                    }}
                  >
                    Conocer más
                  </Button>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Modern slide indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 20, sm: 40 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}
        >
          {slides.map((_, index) => (
            <motion.div
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                cursor: 'pointer',
                height: '4px',
                width: currentSlide === index ? '24px' : '12px',
                backgroundColor: currentSlide === index ? slides[currentSlide].color : '#F5DADF30',
                borderRadius: '2px',
              }}
              whileHover={{ scale: 1.1 }}
              animate={{
                width: currentSlide === index ? '24px' : '12px',
                transition: { duration: 0.3 }
              }}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};