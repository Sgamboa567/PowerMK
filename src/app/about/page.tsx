'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Footer } from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

const BRAND_COLOR = '#FF90B3'; // Matching the home page brand color

const plans = [
  {
    title: 'Plan Mensual',
    price: '$80.000',
    features: [
      'Acceso a todas las herramientas',
      'Reportes básicos',
      'Acceso a soporte técnico',
      'Cobertura global de soporte técnico',
      'Actualización de la plataforma',
      'Acceso a nuevas funcionalidades'
    ]
  },
  {
    title: 'Plan Anual',
    price: '$720.000',
    features: [
      'Todo lo del plan mensual',
      'Descuento del 20%',
      'Reportes avanzados', 
      'Acceso a soporte técnico 24/7',
    ]
  }
];

const features = [
  {
    icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
    title: 'Ventas',
    description: 'Visualiza y analiza datos de ventas.'
  },
  {
    icon: <InventoryIcon sx={{ fontSize: 40 }} />,
    title: 'Inventario',
    description: 'Gestiona y controla tu stock.'
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    title: 'Clientes',
    description: 'Administra tu información de clientes.'
  },
  {
    icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />,
    title: 'Seguimiento',
    description: 'Monitorea y haz seguimiento a tus clientes.'
  }
];

export default function AboutPage() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isProcessing, setIsProcessing] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const handlePlanSelection = async (plan: typeof plans[0]) => {
    setIsProcessing(true);
    
    try {
      if (!session) {
        // Si no hay sesión, redirigir a login
        router.push('/login?callbackUrl=/about');
        return;
      }
      
      // Si el usuario está autenticado, redirigir a la página de pago
      const planType = plan.title === 'Plan Mensual' ? 'plan-mensual' : 'plan-anual';
      router.push(`/payment?plan=${planType}`);
      
    } catch (error) {
      console.error('Error en selección de plan:', error);
    } finally {
      setIsProcessing(false);
    }
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
      {/* Geometric background matching home page */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: theme.palette.mode === 'dark' ? 0.5 : 0.8 }}>
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${BRAND_COLOR}15, ${BRAND_COLOR}05)`
                : `linear-gradient(135deg, ${BRAND_COLOR}30, ${BRAND_COLOR}10)`,
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

      <Container maxWidth="lg" sx={{ pt: 16, pb: 8, position: 'relative', zIndex: 2 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                color: theme.palette.mode === 'dark' ? '#F5DADF' : '#000000',
                mb: 6,
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 100,
                  height: 3,
                  background: '#F5DADF',
                  borderRadius: '2px'
                }
              }}
            >
              Sobre PowerMK
            </Typography>
          </motion.div>

          <Grid container spacing={6}>
            {/* Descripción */}
            <Grid item xs={12} md={6}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(245,218,223,0.1)' : '1px solid rgba(245,218,223,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 12px 40px rgba(245,218,223,0.2)',
                    }
                  }}
                >
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      color: '#F5DADF',
                      fontWeight: 600,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    ¿Qué es PowerMK?
                  </Typography>
                  <Typography 
                    paragraph
                    sx={{
                      lineHeight: 1.8,
                      fontSize: '1.1rem',
                      letterSpacing: '0.3px'
                    }}
                  >
                    PowerMK es una plataforma integral diseñada específicamente para el modelo de negocio de Mary Kay.
                    Nuestra misión es proporcionar herramientas eficientes para la gestión de tu negocio,
                    permitiéndote enfocarte en lo que realmente importa: hacer crecer tu empresa.
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>

            {/* Beneficios con iconos y animaciones */}
            <Grid item xs={12} md={6}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: theme.palette.mode === 'dark' ? '1px solid rgba(245,218,223,0.1)' : '1px solid rgba(245,218,223,0.3)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 12px 40px rgba(245,218,223,0.2)',
                    }
                  }}
                >
                  <Typography variant="h5" gutterBottom sx={{ color: '#F5DADF' }}>
                    Beneficios
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    {[
                      'Gestión de inventario simplificada',
                      'Seguimiento de clientes fácil',
                      'Control de stock eficiente',
                      'Análisis de datos intuitivo', 
                      'Actualización automática de precios',
                      
                    ].map((benefit, index) => (
                      <Typography
                        key={index}
                        component="li"
                        sx={{ mb: 1 }}
                      >
                        {benefit}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

            {/* Features Section */}
            <Grid item xs={12} sx={{ mt: 8, mb: 4 }}> {/* Añadido margin top */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    textAlign: 'center',
                    mb: 8, // Aumentado el margin bottom
                    color: theme.palette.mode === 'dark' ? '#F5DADF' : '#000000',
                    fontWeight: 600,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 80,
                      height: 3,
                      background: '#F5DADF',
                      borderRadius: '2px'
                    }
                  }}
                >
                  Gestiona tu negocio con facilidad
                </Typography>
              </motion.div>

              <Grid container spacing={4}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4, // Aumentado el padding
                          height: '100%',
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.95)' : 'rgba(255,255,255,0.95)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '16px',
                          border: theme.palette.mode === 'dark' ? '1px solid rgba(245,218,223,0.2)' : '1px solid rgba(245,218,223,0.4)',
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)', // Añadida sombra por defecto
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 16px 48px rgba(245,218,223,0.3)',
                            borderColor: '#F5DADF',
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 90, // Aumentado el tamaño
                            height: 90, // Aumentado el tamaño
                            borderRadius: '50%',
                            bgcolor: 'rgba(245,218,223,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px', // Aumentado el margin bottom
                            color: '#F5DADF',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'rgba(245,218,223,0.25)',
                              transform: 'rotate(360deg) scale(1.1)',
                            }
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{
                            mb: 2, // Aumentado el margin bottom
                            fontWeight: 600,
                            color: theme.palette.mode === 'dark' ? '#F5DADF' : '#000000',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '1.1rem',
                            lineHeight: 1.6
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Planes con efectos mejorados */}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Typography 
                  variant="h3" 
                  sx={{ 
                    textAlign: 'center', 
                    mb: 4,
                    fontWeight: 600,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                    color: theme.palette.mode === 'dark' ? '#F5DADF' : '#000000',
                  }}
                >
                  Nuestros Planes
                </Typography>
                <Grid container spacing={4}>
                  {plans.map((plan, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            textAlign: 'center',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            border: theme.palette.mode === 'dark' ? '1px solid rgba(245,218,223,0.1)' : '1px solid rgba(245,218,223,0.3)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 12px 40px rgba(245,218,223,0.2)',
                            }
                          }}
                        >
                          <Typography variant="h4" gutterBottom sx={{ color: '#F5DADF' }}>
                            {plan.title}
                          </Typography>
                          <Typography variant="h3" gutterBottom>
                            {plan.price}
                          </Typography>
                          <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
                            {plan.features.map((feature, idx) => (
                              <Typography key={idx} component="li" sx={{ mb: 1 }}>
                                {feature}
                              </Typography>
                            ))}
                          </Box>
                          <Button
                            variant="contained"
                            size="large"
                            onClick={() => handlePlanSelection(plan)}
                            disabled={isProcessing}
                            sx={{
                              mt: 3,
                              bgcolor: '#F5DADF',
                              color: 'black',
                              fontWeight: 600,
                              padding: '12px 32px',
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontSize: '1.1rem',
                              boxShadow: '0 4px 15px rgba(245,218,223,0.3)',
                              '&:hover': {
                                bgcolor: 'white',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(245,218,223,0.4)',
                              }
                            }}
                          >
                            {isProcessing ? 'Procesando...' : 'Seleccionar Plan'}
                          </Button>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
      
      <Footer />
    </Box>
  );
}