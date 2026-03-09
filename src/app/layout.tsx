
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { AuthRedirector } from '@/components/auth/auth-redirector';
import { CommandCenter } from '@/components/layout/command-center';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'EvenTide',
  description: 'Your Event, Reimagined.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <Suspense fallback={null}>
            <AuthRedirector />
          </Suspense>
          <CommandCenter />
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
