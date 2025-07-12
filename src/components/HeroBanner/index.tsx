'use client';

import { Box, Button, Container, Typography, useMediaQuery, CircularProgress } from '@mui/material';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect, useCallback } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { keyframes } from '@mui/system';
import { supabase } from '@/lib/supabase';

// Constantes
const BRAND_COLOR = '#FF90B3';
const GOLD_COLOR = '#c59d5f';

// Keyframes optimizados
const glowAnimation = keyframes`
  0% { opacity: 0.4 }
  50% { opacity: 0.7 }
  100% { opacity: 0.4 }
`;

// Contenido centralizado para fácil mantenimiento
const slides = [
  {
    title: 'Bienvenida a PowerMK',
    subtitle: 'Tu plataforma integral de gestión Mary Kay',
    color: BRAND_COLOR
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

export const HeroBanner = () => {
  // Hooks
  const router = useRouter();
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Animaciones
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useSpring(mouseX, { damping: 25, stiffness: 150 });
  const cursorY = useSpring(mouseY, { damping: 25, stiffness: 150 });

  // Memoizar la función de navegación para evitar re-renders
  const handleNavigation = useCallback(async (session: any) => {
    if (!session) {
      return '/login';
    }
    
    const userId = session.user?.id;
    
    if (!userId) {
      return '/login';
    }

    try {
      // Obtener información de usuario de Supabase
      const { data, error } = await supabase
        .from('users')
        .select('role, subscription_status, subscription_end_date')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Verificar rol y estado de suscripción
      const isAdmin = data?.role?.toLowerCase() === 'admin';
      const hasActiveSubscription = 
        data?.subscription_status === 'active' && 
        (data?.subscription_end_date ? new Date(data.subscription_end_date) > new Date() : true);

      // Redirigir según rol y suscripción
      if (isAdmin) {
        return '/admin';
      } else if (data?.role?.toLowerCase() === 'consultant' || data?.role?.toLowerCase() === 'director') {
        return hasActiveSubscription
          ? data.role.toLowerCase() === 'consultant' ? '/consultant' : '/director'
          : '/payment';
      } else {
        return '/';
      }
    } catch (error) {
      console.error('Error verificando el rol del usuario:', error);
      return '/';
    }
  }, []);

  // Cambio automático de slides
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
  }, [mouseX, mouseY]);

  // Manejar clic en "Comenzar ahora"
  const handleStartNow = async () => {
    setIsProcessing(true);
    try {
      const url = await handleNavigation(session);
      router.push(url);
    } catch (error) {
      console.error("Error durante la navegación:", error);
      router.push('/login');
    } finally {
      setIsProcessing(false);
    }
  };

  // Variantes de animación para las slides
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
          ? 'linear-gradient(135deg, #1A1A1A 0%, #242424 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #F9F0F2 100%)',
      }}
    >
      {/* Fondo geométrico con animación sutil */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: theme.palette.mode === 'dark' ? 0.6 : 0.7 }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${slides[currentSlide].color}15, ${GOLD_COLOR}10)`
                : `linear-gradient(135deg, ${slides[currentSlide].color}20, ${GOLD_COLOR}10)`,
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
        
        {/* Elementos decorativos para estilo Mary Kay */}
        <Box
          component={motion.div}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          sx={{
            position: 'absolute',
            top: '20%',
            right: '15%',
            width: { xs: 100, md: 200 },
            height: { xs: 100, md: 200 },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${GOLD_COLOR}20 0%, transparent 70%)`,
          }}
        />
        
        <Box
          component={motion.div}
          animate={{
            opacity: [0.4, 0.6, 0.4],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: 1,
          }}
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '10%',
            width: { xs: 120, md: 250 },
            height: { xs: 120, md: 250 },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${BRAND_COLOR}15 0%, transparent 70%)`,
          }}
        />
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
            transition={{ 
              duration: 0.6, 
              ease: [0.43, 0.13, 0.23, 0.96] 
            }}
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
                px: { xs: 2, sm: 4 },
                py: { xs: 4, md: 0 },
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5rem' },
                    fontWeight: 800,
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, ${slides[currentSlide].color} 0%, #F5DADF 100%)`
                      : `linear-gradient(135deg, ${slides[currentSlide].color} 0%, ${GOLD_COLOR} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: { xs: 2, sm: 3 },
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    filter: theme.palette.mode === 'dark' 
                      ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' 
                      : 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))',
                    textAlign: 'center',
                  }}
                >
                  {slides[currentSlide].title}
                </Typography>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: theme.palette.mode === 'dark' ? '#F5DADF' : '#444',
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.6rem' },
                    fontWeight: 500,
                    mb: { xs: 4, sm: 6 },
                    opacity: 0.9,
                    letterSpacing: '0.01em',
                    maxWidth: '85%',
                    margin: '0 auto',
                    lineHeight: 1.5,
                  }}
                >
                  {slides[currentSlide].subtitle}
                </Typography>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: { xs: 1.5, sm: 3 }, 
                    justifyContent: 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'center',
                    maxWidth: { xs: '100%', sm: '80%', md: '75%' },
                    mx: 'auto',
                  }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartNow}
                    disabled={isProcessing}
                    sx={{
                      bgcolor: slides[currentSlide].color,
                      color: 'white',
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 3, sm: 5 },
                      borderRadius: '12px',
                      textTransform: 'none',
                      transition: 'all 0.4s ease',
                      fontWeight: 600,
                      width: isMobile ? '100%' : 'auto',
                      boxShadow: `0 8px 20px ${slides[currentSlide].color}40`,
                      '&:hover': {
                        bgcolor: slides[currentSlide].color,
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 30px ${slides[currentSlide].color}60`,
                      },
                      letterSpacing: '0.5px',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transform: 'translateX(-100%)',
                        animation: isProcessing ? 'none' : `${glowAnimation} 2s infinite`,
                      }
                    }}
                    endIcon={
                      isProcessing ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <ArrowForwardIcon />
                      )
                    }
                  >
                    {isProcessing ? 'Procesando...' : 'Comenzar ahora'}
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/about')}
                    sx={{
                      borderColor: GOLD_COLOR,
                      borderWidth: 2,
                      color: theme.palette.mode === 'dark' ? '#F5DADF' : '#444',
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      py: { xs: 1.5, sm: 1.9 },
                      px: { xs: 3, sm: 5 },
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      width: isMobile ? '100%' : 'auto',
                      transition: 'all 0.4s ease',
                      backdropFilter: 'blur(5px)',
                      background: 'transparent',
                      '&:hover': {
                        borderColor: GOLD_COLOR,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(197, 157, 95, 0.1)'
                          : 'rgba(197, 157, 95, 0.05)',
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 30px ${GOLD_COLOR}20`,
                      },
                      letterSpacing: '0.5px',
                    }}
                  >
                    Conocer más
                  </Button>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Indicadores de slides con estilo mejorado */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 30, sm: 50 },
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1.5,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
            borderRadius: 5,
            padding: '10px 16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {slides.map((_, index) => (
            <motion.div
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                cursor: 'pointer',
                height: '6px',
                backgroundColor: currentSlide === index 
                  ? slides[currentSlide].color 
                  : theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(0,0,0,0.2)',
                borderRadius: '3px',
              }}
              animate={{
                width: currentSlide === index ? '28px' : '14px',
              }}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: currentSlide === index 
                  ? slides[currentSlide].color 
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.5)'
                    : 'rgba(0,0,0,0.3)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </Box>
        
        {/* Elemento de marca de agua Mary Kay */}
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ delay: 1, duration: 1 }}
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            fontFamily: 'serif',
            fontSize: { xs: '5rem', md: '10rem' },
            color: theme.palette.mode === 'dark' ? '#FFF' : '#000',
            fontWeight: 'bold',
            pointerEvents: 'none',
            display: { xs: 'none', md: 'block' }
          }}
        >
          MK
        </Box>
      </Container>
    </Box>
  );
};