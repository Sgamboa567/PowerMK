'use client'
import { Button, Container, Typography } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        PowerMK
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Sistema de Gestión Mary Kay
      </Typography>
      <Link href="/login" passHref>
        <Button variant="contained" color="primary">
          Iniciar Sesión
        </Button>
      </Link>
    </Container>
  );
}