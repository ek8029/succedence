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
      <body style={{fontFamily: 'Source Serif Pro, Georgia, serif', margin: 0, padding: 0, overflow: 'hidden', height: '100vh', width: '100vw', position: 'relative'}}>
        <style>{`
          nav, header, footer { display: none !important; }
          #ai-assistant-root, [id*="ai-assistant"], [class*="AIAssistant"] { display: none !important; }
          button[class*="ai-"], div[class*="ai-chat"] { display: none !important; }
        `}</style>
        {children}
      </body>
    </html>
  );
}
