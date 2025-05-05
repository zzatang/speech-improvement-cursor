"use client";

import Link from "next/link";
import Image from "next/image";

export default function EnvironmentErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image
              src="/logo-icon.svg"
              alt="Speech Buddy Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Configuration Error
          </h1>
          <div className="h-1 w-16 bg-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">
            The application is missing required environment variables.
          </p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                This is a server configuration issue. Please contact an
                administrator to resolve this problem.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          For Administrators
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          The application is missing one or more critical environment variables
          required for proper operation. Please refer to the Vercel deployment
          documentation to ensure all required variables are properly
          configured.
        </p>

        <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-700 mb-6 overflow-auto max-h-40">
          <p>1. Check Vercel project settings</p>
          <p>2. Configure required environment variables:</p>
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</li>
            <li>CLERK_SECRET_KEY</li>
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            <li>GOOGLE_CLOUD_PROJECT_ID</li>
            <li>GOOGLE_CLOUD_CREDENTIALS</li>
            <li>GOOGLE_TTS_VOICE_NAME</li>
            <li>GOOGLE_STT_LANGUAGE_CODE</li>
            <li>And other required variables...</li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Return to Home Page
          </Link>
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        If the issue persists, please refer to the documentation or contact
        support.
      </p>
    </div>
  );
} 