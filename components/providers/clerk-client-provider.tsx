'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { dark } from '@clerk/themes'

// Check if we're in a CI environment
const isCI = process.env.CI === 'true' || process.env.IS_CI_BUILD === 'true';

export default function ClerkClientProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  
  // In CI builds, bypass Clerk initialization
  if (isCI) {
    console.log('CI environment detected, bypassing Clerk authentication')
    return <>{children}</>
  }
  
  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  )
}
