'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Providers } from '@/components/providers/Providers'
import { Navbar } from '@/components/Navbar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}