import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PowerMK - Sistema de Gestión Mary Kay',
  description: 'Sistema de Gestión Mary Kay',
  metadataBase: new URL('https://power-mk.vercel.app/'),
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
        url: '/logo.webp',
        width: 512,
        height: 512,
        alt: 'PowerMK Logo',
      },
    ],
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
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