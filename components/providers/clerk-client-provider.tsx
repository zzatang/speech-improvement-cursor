'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { dark } from '@clerk/themes'

export default function ClerkClientProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  
  // Log if CI environment is detected, but still render ClerkProvider
  // ClerkProvider should handle missing/mock keys gracefully or use them for a "signed-out" state.
  if (process.env.CI === 'true' || process.env.IS_CI_BUILD === 'true') {
    console.log('CI environment detected. ClerkProvider will use available (mock) environment variables.');
  }
  
  return (
    <ClerkProvider
      // Publishable key will be picked up from process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
      // Secret key for backend use is handled by Clerk's Next.js SDK internally via process.env.CLERK_SECRET_KEY
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
