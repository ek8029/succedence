import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import { Manrope } from 'next/font/google'

const manrope = Manrope({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

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
    <html lang="en" className={manrope.variable}>
      <body className="font-sans bg-surface-color text-text-secondary">
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
