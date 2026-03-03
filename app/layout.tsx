import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Succedence | Standardize SMB Valuations',
  description: 'Transaction-backed, defensible multiples for small business valuations. IBBA data, risk-adjusted methodology, deal quality scoring. Free. No signup required.',
  metadataBase: new URL('https://www.succedence.com'),
  openGraph: {
    siteName: 'Succedence',
    title: 'Standardize SMB Valuations | Succedence',
    description: 'Transaction-backed, defensible multiples for small business valuations.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-surface-color text-text-secondary antialiased">
        <AuthProvider>
          <div className="min-h-screen">
            <Navbar />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
