import { Metadata } from 'next';
import { metadata } from './metadata';

// Estos componentes necesitan estar en el cliente, así que los importamos con su propia directiva 'use client'
import { Navbar } from '@/components/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Providers } from '@/components/providers/Providers'
import { SubscriptionChecker } from '@/components/SubscriptionChecker'

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Providers>
            <Navbar />
            <SubscriptionChecker />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}