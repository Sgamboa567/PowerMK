import { Metadata } from 'next';
import { metadata } from './metadata';
import { Navbar } from '@/components/Navbar'
import { Providers } from '@/components/providers/Providers'
import { SubscriptionChecker } from '@/components/SubscriptionChecker'
import { ThemeProvider } from '@/components/ThemeProvider'

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider>
            <SubscriptionChecker />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}