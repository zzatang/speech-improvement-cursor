'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-md w-full space-y-8 p-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-100 p-3 flex items-center justify-center mb-4">
            <Image 
              src="/logo-icon.svg" 
              alt="Speech Buddy Logo" 
              width={50} 
              height={50}
            />
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Authentication Error</h1>
          <p className="text-gray-600">Something went wrong during the sign-in process.</p>
        </div>

        {/* Error Message */}
        <div className="bg-white rounded-2xl border-2 border-red-200 p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sign-in Failed</h2>
            
            <p className="text-gray-600 mb-6">
              We couldn't complete your sign-in. This might be due to:
            </p>
            
            <ul className="text-left text-gray-600 mb-6 space-y-2">
              <li>• An expired or invalid authentication link</li>
              <li>• A cancelled OAuth authorization</li>
              <li>• Network connectivity issues</li>
            </ul>
            
            <div className="space-y-3">
              <Link 
                href="/auth/login"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block text-center"
              >
                Try Signing In Again
              </Link>
              
              <Link 
                href="/auth/signup"
                className="w-full border-2 border-blue-600 text-blue-600 py-3 px-4 rounded-xl font-medium hover:bg-blue-50 transition-colors inline-block text-center"
              >
                Create New Account
              </Link>
              
              <Link 
                href="/"
                className="w-full text-gray-600 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors inline-block text-center"
              >
                ← Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 