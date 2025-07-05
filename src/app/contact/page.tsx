'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  Divider,
  useTheme,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import SubjectIcon from '@mui/icons-material/Subject';
import MessageIcon from '@mui/icons-material/Message';
import InstagramIcon from '@mui/icons-material/Instagram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { motion } from 'framer-motion';
import { useMediaQuery } from '@mui/material';
import { submitContact } from '../actions/contact';

const BRAND_COLOR = '#FF90B3';

// Datos de contacto centralizados para fácil mantenimiento
const CONTACT_INFO = {
  email: 'sgamboa765@gmail.com',
  whatsapp: '+573227996487', // Sin espacios para el enlace
  whatsappDisplay: '+57 322 799 6487', // Con formato para mostrar
  instagram: 'lina_makeupmk',
  availability: 'Lunes a viernes de 8am a 6pm'
};

export default function Contact() {
  // Tema y media queries
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Estados para manejo de UI
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Importante: Usar useEffect para evitar errores de hidratación
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Validar correo electrónico
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario antes de enviar
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError(true);
      setErrorMessage('Por favor completa todos los campos requeridos.');
      return;
    }
    
    // Validar formato de email
    if (!isValidEmail(formData.email)) {
      setError(true);
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }
    
    setLoading(true);
    setError(false);
    setSuccess(false);
    setErrorMessage('');

    try {
      // Usar Server Action
      const result = await submitContact(formData);
      
      if (!result.success) {
        throw new Error(result.error || 'Error al procesar la solicitud');
      }
      
      // Éxito
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      console.error('Error al enviar el formulario:', err);
      setError(true);
      setErrorMessage(err.message || 'Ha ocurrido un error. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Componente para íconos de contacto
  const ContactItem = ({ 
    icon, 
    label, 
    value, 
    displayValue, 
    href 
  }: { 
    icon: React.ReactNode, 
    label: string, 
    value: string,
    displayValue?: string,
    href: string 
  }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '8px',
          bgcolor: `${BRAND_COLOR}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {label}
        </Typography>
        <Link 
          href={href}
          target="_blank" 
          rel="noopener noreferrer"
          underline="hover"
          sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 500,
            display: 'block',
            transition: 'color 0.2s',
            '&:hover': {
              color: BRAND_COLOR
            }
          }}
        >
          {displayValue || value}
        </Link>
      </Box>
    </Box>
  );

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
      {/* Fondo geométrico - Optimizado para rendimiento */}
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

      <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 16 }, pb: 8, position: 'relative', zIndex: 5 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.mode === 'dark' ? '#ffffff' : '#333333',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              mb: 3
            }}
          >
            Contacta con nosotros
          </Typography>

          <Typography 
            variant="h6" 
            align="center" 
            sx={{
              fontWeight: 400,
              color: theme.palette.text.secondary,
              mb: 5,
              maxWidth: 800,
              mx: 'auto'
            }}
          >
            ¿Tienes alguna pregunta o comentario? Estamos aquí para ayudarte y escuchar tus sugerencias.
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              {/* Solo renderizar el formulario en el cliente para evitar errores de hidratación */}
              {isClient && (
                <Paper
                  elevation={0}
                  component={motion.div}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  sx={{
                    p: { xs: 3, md: 4 },
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(26, 26, 26, 0.6)'
                      : 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: `1px solid ${
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.1)'
                    }`,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Envíanos un mensaje
                  </Typography>
                  
                  <form onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Nombre"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: BRAND_COLOR }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Correo electrónico"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon sx={{ color: BRAND_COLOR }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Asunto"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SubjectIcon sx={{ color: BRAND_COLOR }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Mensaje"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          multiline
                          rows={5}
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MessageIcon sx={{ color: BRAND_COLOR }} />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            px: 3,
                            borderRadius: '8px',
                            backgroundColor: BRAND_COLOR,
                            '&:hover': {
                              backgroundColor: '#FF80A3',
                            },
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 10px rgba(255, 144, 179, 0.3)',
                          }}
                        >
                          {loading ? (
                            <>
                              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                              Enviando...
                            </>
                          ) : (
                            'Enviar mensaje'
                          )}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                component={motion.div}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                sx={{
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(26, 26, 26, 0.6)'
                    : 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: `1px solid ${
                    theme.palette.mode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.1)'
                  }`,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Información de contacto
                </Typography>
                
                {/* Email con enlace mailto: */}
                <ContactItem 
                  icon={<EmailIcon sx={{ color: BRAND_COLOR }} />}
                  label="Correo electrónico"
                  value={CONTACT_INFO.email}
                  href={`mailto:${CONTACT_INFO.email}`}
                />
                
                {/* WhatsApp con enlace a chat */}
                <ContactItem 
                  icon={<WhatsAppIcon sx={{ color: BRAND_COLOR }} />}
                  label="WhatsApp"
                  value={CONTACT_INFO.whatsapp}
                  displayValue={CONTACT_INFO.whatsappDisplay}
                  href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/[+\s]/g, '')}`}
                />
                
                {/* Instagram con enlace al perfil */}
                <ContactItem 
                  icon={<InstagramIcon sx={{ color: BRAND_COLOR }} />}
                  label="Instagram"
                  value={`@${CONTACT_INFO.instagram}`}
                  href={`https://instagram.com/${CONTACT_INFO.instagram}`}
                />

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Estamos disponibles para atenderte de {CONTACT_INFO.availability}. ¡Contáctanos y te responderemos lo antes posible!
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Container>

      {/* Alertas de notificación */}
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          ¡Mensaje enviado con éxito! Te responderemos lo antes posible.
        </Alert>
      </Snackbar>

      <Snackbar 
        open={error} 
        autoHideDuration={6000} 
        onClose={() => setError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError(false)} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {errorMessage || 'Ha ocurrido un error. Por favor, intenta nuevamente.'}
        </Alert>
      </Snackbar>
    </Box>
  );
}