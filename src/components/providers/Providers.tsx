'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from './ThemeProvider'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system">
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}