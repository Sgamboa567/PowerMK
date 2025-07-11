import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    title: 'Inicio',
    template: '%s | PowerMK',
    default: 'PowerMK - Sistema de Gestión Mary Kay',
  },
  metadataBase: new URL('https://power-mk.vercel.app/'),
  description: 'Sistema de Gestión Mary Kay',
  openGraph: {
    title: 'PowerMK - Sistema de Gestión Mary Kay',
    description: 'Sistema de Gestión Mary Kay para consultoras independientes',
    siteName: 'PowerMK',
  },
  icons: {
    icon: '/favicon.ico',
  },
}