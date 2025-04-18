'use client';

import { Box, Button, Container, Typography, useMediaQuery } from '@mui/material';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const slides = [
  {
    title: 'Bienvenida a PowerMK',
    subtitle: 'Tu plataforma integral de gestión Mary Kay',
    color: '#FF90B3'
  },
  {
    title: 'Gestiona tu Negocio',
    subtitle: 'Controla inventario, ventas y clientes en un solo lugar',
    color: '#FF7AA2'
  },
  {
    title: 'Impulsa tu Éxito',
    subtitle: 'Herramientas diseñadas para consultoras Mary Kay',
    color: '#FF6691'
  }
];

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
      {/* Interactive background effect */}
      <motion.div
        style={{
          position: 'absolute',
          width: isMobile ? 300 : 600,
          height: isMobile ? 300 : 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${slides[currentSlide].color}20 0%, ${slides[currentSlide].color}00 70%)`,
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Animated background shapes */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              background: `${slides[currentSlide].color}10`,
              borderRadius: '50%',
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', height: '100vh' }}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide}
            custom={1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center', maxWidth: '800px' }}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4.5rem' },
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${slides[currentSlide].color} 0%, ${theme.palette.mode === 'dark' ? '#F5DADF' : '#FF4081'} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 3,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {slides[currentSlide].title}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    color: theme.palette.mode === 'dark' ? '#F5DADF' : '#666',
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    fontWeight: 500,
                    mb: 5,
                    opacity: 0.9,
                    letterSpacing: '0.02em',
                  }}
                >
                  {slides[currentSlide].subtitle}
                </Typography>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => router.push(session ? '/dashboard' : '/login')}
                      sx={{
                        bgcolor: slides[currentSlide].color,
                        color: 'white',
                        fontSize: '1.1rem',
                        py: 2,
                        px: 4,
                        borderRadius: '12px',
                        textTransform: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: theme.palette.mode === 'dark' 
                          ? '0 8px 32px rgba(245,218,223,0.2)'
                          : '0 8px 32px rgba(255,64,129,0.2)',
                        '&:hover': {
                          bgcolor: slides[currentSlide].color,
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 40px rgba(255,64,129,0.3)',
                        },
                      }}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Comenzar ahora
                    </Button>
                  </Box>
                </motion.div>
              </motion.div>
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
          }}
        >
          {slides.map((_, index) => (
            <motion.div
              key={index}
              style={{
                cursor: 'pointer',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: currentSlide === index ? slides[currentSlide].color : '#F5DADF50',
              }}
              whileHover={{ scale: 1.2 }}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};