import type { Metadata } from 'next'
import './globals.css'
import localFont from 'next/font/local'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'
import ClerkClientProvider from '@/components/providers/clerk-client-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
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
        url: '/logo.svg',
        width: 220,
        height: 100,
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
    images: ['/logo.svg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkClientProvider>
          <TanstackClientProvider>
            {children}
          </TanstackClientProvider>
        </ClerkClientProvider>
      </body>
    </html>
  )
}
