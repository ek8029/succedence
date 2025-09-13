import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'DealSense - Sophisticated Business Marketplace',
  description: 'A refined platform for sophisticated business transactions and acquisitions',
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
