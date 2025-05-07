'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { isClerkAvailable } from '@/utils/auth-helpers'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  // In CI environment, we don't use Clerk auth or any auth-related components
  const isCI = process.env.CI === 'true' || process.env.IS_CI_BUILD === 'true'
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-24">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="text-lg text-muted-foreground">The page you are looking for doesn't exist or has been moved.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
          
          {!isCI && isClerkAvailable() && (
            <Button asChild variant="outline">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 