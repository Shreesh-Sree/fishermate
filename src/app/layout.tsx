import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'FisherMate.AI - AI Fishing Companion',
  description: 'AI-powered fishing companion with weather updates, safety guidelines, fishing journal, and voice assistance.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  try {
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    console.log('ServiceWorker registered');
                  } catch (error) {
                    console.log('ServiceWorker registration failed');
                  }
                });
              }
            `
          }}
        />
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <AuthProvider>
            <LanguageProvider>
              <ThemeProvider>
                <Header />
                <main className="min-h-screen pt-16">
                  {children}
                </main>
                <Toaster />
              </ThemeProvider>
            </LanguageProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
