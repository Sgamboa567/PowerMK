'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar'; 

const BRAND_COLOR = '#FF90B3';

const steps = ['Selección de plan', 'Método de pago', 'Confirmación'];

export default function PaymentPage() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [plan, setPlan] = useState({
    title: 'Plan Mensual',
    price: '$80.000',
    isMonthly: true
  });
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    
    // Set plan based on URL parameter
    if (planParam === 'plan-anual') {
      setPlan({
        title: 'Plan Anual',
        price: '$720.000',
        isMonthly: false
      });
    }
  }, [status, router, planParam]);
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handlePayment = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      // In a real app, this would connect to a payment gateway
      // For now, we'll simulate a payment and update the user's status
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user subscription status
      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: 'active',
          // You might want to store additional info like:
          subscription_plan: plan.isMonthly ? 'monthly' : 'annual',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(
            new Date().setMonth(
              new Date().getMonth() + (plan.isMonthly ? 1 : 12)
            )
          ).toISOString()
        })
        .eq('id', session.user.id);
      
      if (error) throw error;
      
      setSuccess(true);
      handleNext();
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/consultant');
      }, 3000);
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('Error al procesar el pago. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
      {/* Agregar el componente Navbar */}
      <Navbar />

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

      <Container maxWidth="md" sx={{ pt: 16, pb: 8, position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
            }}
          >
            Suscripción PowerMK
          </Typography>
          
          <Paper
            elevation={0}
            sx={{
              p: 4,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: theme.palette.mode === 'dark' ? '1px solid rgba(245,218,223,0.1)' : '1px solid rgba(245,218,223,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {activeStep === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                  Has seleccionado:
                </Typography>
                
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    border: `1px solid ${BRAND_COLOR}40`,
                    borderRadius: '12px',
                    mb: 3,
                  }}
                >
                  <Typography variant="h4" sx={{ color: BRAND_COLOR, mb: 1 }}>
                    {plan.title}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
                    {plan.price}
                  </Typography>
                  <Typography variant="body1">
                    {plan.isMonthly
                      ? 'Facturación mensual'
                      : 'Facturación anual (ahorro del 20%)'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  {/* Botón para regresar a la página de about/planes */}
                  <Button 
                    onClick={() => router.push('/about')}
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Regresar a planes
                  </Button>
                  
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      bgcolor: BRAND_COLOR,
                      '&:hover': {
                        bgcolor: `${BRAND_COLOR}dd`,
                      },
                    }}
                  >
                    Continuar
                  </Button>
                </Box>
              </motion.div>
            )}
            
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                  Selecciona tu método de pago
                </Typography>
                
                {/* Here you would integrate your payment processor */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Para este demo, simularemos un pago exitoso.
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handlePayment}
                    disabled={loading}
                    sx={{
                      bgcolor: BRAND_COLOR,
                      '&:hover': {
                        bgcolor: `${BRAND_COLOR}dd`,
                      },
                      minWidth: 200,
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      `Pagar ${plan.price}`
                    )}
                  </Button>
                  
                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button onClick={handleBack} disabled={loading}>
                    Atrás
                  </Button>
                </Box>
              </motion.div>
            )}
            
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  {success ? (
                    <>
                      <Typography variant="h4" sx={{ color: 'success.main', mb: 2 }}>
                        ¡Pago Exitoso!
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        Tu suscripción ha sido activada correctamente. Serás redirigido al dashboard en unos segundos.
                      </Typography>
                      <CircularProgress size={24} sx={{ mt: 2 }} />
                    </>
                  ) : (
                    <Typography variant="body1">
                      Procesando tu pago...
                    </Typography>
                  )}
                </Box>
              </motion.div>
            )}
          </Paper>
        </motion.div>
      </Container>
      
      <Footer />
    </Box>
  );
}