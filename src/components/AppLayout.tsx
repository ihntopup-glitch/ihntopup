'use client';

import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/contexts/CartContext';
import Footer from '@/components/layout/Footer';
import InstallAppPrompt from '@/components/InstallAppPrompt';
import { FirebaseClientProvider } from '@/firebase';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'font-body antialiased',
          !isAdminPage && 'min-h-screen bg-gray-50'
        )}
      >
        <FirebaseClientProvider>
          <AuthProvider>
            <CartProvider>
              {isAdminPage ? (
                <main>{children}</main>
              ) : (
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1 pb-24 pt-16">{children}</main>
                  <Footer />
                </div>
              )}
              {isClient && !isAdminPage && <BottomNav />}
              {!isAdminPage && <InstallAppPrompt />}
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
