import { Metadata } from 'next';
import { metadata } from './metadata';
import { Providers } from '@/components/providers/Providers';
import { SubscriptionChecker } from '@/components/SubscriptionChecker';

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
          {children}
          <SubscriptionChecker />
        </Providers>
      </body>
    </html>
  );
}