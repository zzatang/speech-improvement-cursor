import type { Metadata } from 'next'
import './globals.css'
import localFont from 'next/font/local'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'
import ClerkClientProvider from '@/components/providers/clerk-client-provider'
import { Inter } from 'next/font/google'

// Load Inter as the main font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

// Load local Geist fonts
const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Speech Buddy - Fun Speech Practice for Kids',
  description: 'Interactive speech practice app designed to help young speakers improve pronunciation through engaging games and activities.',
  keywords: 'speech therapy, kids, speech practice, pronunciation, speech games',
  authors: [{ name: 'Speech Buddy Team' }],
  icons: {
    icon: '/logo-icon.svg',
  },
  openGraph: {
    title: 'Speech Buddy - Fun Speech Practice for Kids',
    description: 'Interactive speech practice app designed to help young speakers improve pronunciation through engaging games and activities.',
    url: 'https://speechbuddy.app',
    siteName: 'Speech Buddy',
    images: [
      {
        url: '/logo-icon.svg',
        width: 192,
        height: 192,
        alt: 'Speech Buddy Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Speech Buddy - Fun Speech Practice for Kids',
    description: 'Interactive speech practice app designed to help young speakers improve pronunciation through engaging games and activities.',
    images: ['/logo-icon.svg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/opendyslexic" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClerkClientProvider>
          <TanstackClientProvider>
            {children}
          </TanstackClientProvider>
        </ClerkClientProvider>
      </body>
    </html>
  )
}
