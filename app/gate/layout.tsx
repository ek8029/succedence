import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Access Gate - Succedence',
  description: 'Enter password to access Succedence',
};

export default function GateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
        {children}
      </body>
    </html>
  );
}
