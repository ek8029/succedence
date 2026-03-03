import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Succedence | Free Business Valuation Tool for Brokers',
  description: 'Free SDE-based business valuation calculator. 50+ industries, IBBA transaction data, risk-adjusted multiples. Built for business brokers.',
  metadataBase: new URL('https://www.succedence.com'),
  openGraph: {
    siteName: 'Succedence',
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
      <body style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
        <AuthProvider>
          <div className="min-h-screen bg-brand-darker text-white">
            <Navbar />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
