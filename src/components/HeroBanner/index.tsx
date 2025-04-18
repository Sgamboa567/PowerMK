'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    image: '/banner1.jpg',
    title: 'Bienvenida a PowerMK',
    subtitle: 'Tu plataforma integral de gestión Mary Kay'
  },
  {
    image: '/banner2.jpg',
    title: 'Gestiona tu Negocio',
    subtitle: 'Controla inventario, ventas y clientes en un solo lugar'
  },
  {
    image: '/banner3.jpg',
    title: 'Impulsa tu Éxito',
    subtitle: 'Herramientas diseñadas para consultoras Mary Kay'
  }
];

export const HeroBanner = () => {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <Box sx={{ height: '100vh', position: 'relative' }}>
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        navigation
        pagination={{ clickable: true }}
        effect="fade"
        autoplay={{ delay: 5000 }}
        loop
        style={{ height: '100%' }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <Box
              sx={{
                height: '100vh',
                background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Container maxWidth="lg">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      color: 'white',
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      fontWeight: 700,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      mb: 2,
                    }}
                  >
                    {slide.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#F5DADF',
                      mb: 4,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                      maxWidth: 600,
                    }}
                  >
                    {slide.subtitle}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
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
                        '&:hover': {
                          bgcolor: 'white',
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
                        color: '#F5DADF',
                        fontSize: '1.1rem',
                        py: 1.5,
                        px: 4,
                        '&:hover': {
                          borderColor: 'white',
                          color: 'white',
                        },
                      }}
                    >
                      Conoce más
                    </Button>
                  </Box>
                </motion.div>
              </Container>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};