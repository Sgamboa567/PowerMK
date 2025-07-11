import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PowerMK - Sistema de Gestión Mary Kay',
  description: 'Sistema de Gestión Mary Kay',
  metadataBase: new URL('https://power-mk.vercel.app/'),

  // Para páginas específicas, usar esta plantilla
  // Se aplicará como "Nombre Página | PowerMK"
  template: '%s | PowerMK',

  openGraph: {
    title: 'PowerMK - Sistema de Gestión Mary Kay',
    description: 'Sistema de Gestión Mary Kay para consultoras independientes',
    siteName: 'PowerMK',
    type: 'website',
    locale: 'es_ES',
    url: 'https://power-mk.vercel.app/',
    images: [
      {
        url: 'https://power-mk.vercel.app/images/og-image.jpg', // Asegúrate de tener esta imagen
        width: 1200,
        height: 630,
        alt: 'PowerMK Logo',
      },
    ],
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png', // Opcional: añadir un ícono para Apple
  },

  viewport: {
    width: 'device-width',
    initialScale: 1,
  },

  robots: {
    index: true,
    follow: true,
  },
};