'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    title: 'Bienvenida a PowerMK',
    subtitle: 'Tu plataforma integral de gestión Mary Kay'
  },
  {
    title: 'Gestiona tu Negocio',
    subtitle: 'Controla inventario, ventas y clientes en un solo lugar'
  },
  {
    title: 'Impulsa tu Éxito',
    subtitle: 'Herramientas diseñadas para consultoras Mary Kay'
  }
];

export const HeroBanner = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const theme = useTheme();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(26,26,26,0.95) 0%, rgba(26,26,26,1) 100%)'
          : 'linear-gradient(135deg, rgba(245,218,223,0.15) 0%, rgba(255,255,255,1) 100%)',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle, rgba(245,218,223,0.2) 0%, rgba(245,218,223,0) 70%)'
            : 'radial-gradient(circle, rgba(245,218,223,0.4) 0%, rgba(245,218,223,0) 70%)',
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        navigation
        pagination={{ clickable: true }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        style={{ height: '100vh' }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            {({ isActive }) => (
              <Container 
                maxWidth="lg" 
                sx={{ 
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0,
                    y: isActive ? 0 : 30,
                  }}
                  transition={{ duration: 0.8 }}
                  style={{ 
                    textAlign: 'center',
                    width: '100%',
                    position: 'absolute',
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      color: theme.palette.mode === 'dark' ? '#F5DADF' : '#1A1A1A',
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      fontWeight: 700,
                      textShadow: theme.palette.mode === 'dark' 
                        ? '2px 2px 4px rgba(0,0,0,0.3)'
                        : '2px 2px 4px rgba(0,0,0,0.1)',
                      mb: 2,
                    }}
                  >
                    {slide.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: theme.palette.mode === 'dark' ? '#F5DADF' : '#666',
                      opacity: 0.9,
                      mb: 4,
                      textShadow: theme.palette.mode === 'dark'
                        ? '1px 1px 2px rgba(0,0,0,0.3)'
                        : '1px 1px 2px rgba(0,0,0,0.1)',
                      maxWidth: 600,
                      margin: '0 auto',
                    }}
                  >
                    {slide.subtitle}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => router.push(session ? '/dashboard' : '/login')}
                      sx={{
                        bgcolor: '#F5DADF',
                        color: 'black',
                        fontSize: '1.1rem',
                        py: 1.5,
                        px: 4,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'white',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Comenzar ahora
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => router.push('/about')}
                      sx={{
                        borderColor: '#F5DADF',
                        color: theme.palette.mode === 'dark' ? '#F5DADF' : '#000',
                        fontSize: '1.1rem',
                        py: 1.5,
                        px: 4,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.mode === 'dark' ? 'white' : '#F5DADF',
                          color: theme.palette.mode === 'dark' ? 'white' : '#F5DADF',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Conoce más
                    </Button>
                  </Box>
                </motion.div>
              </Container>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};