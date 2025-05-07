"use client"

import { ClerkProvider } from "@clerk/nextjs";
import { getEnvOrFallback } from "@/utils/env-check";

// Check if we're in a CI environment
const isCI = process.env.CI === 'true' || process.env.IS_CI_BUILD === 'true';

export function CustomClerkProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // In CI builds, we need to prevent Clerk from validating publishable key
  if (isCI) {
    return <>{children}</>;
  }
  
  // Use the regular ClerkProvider in non-CI environments
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
} 