'use client';

import Link from 'next/link';
import { CreditCard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { UserIcon, WalletIcon } from '@/components/icons';
import { Button } from '../ui/button';
import { useEffect, useState }from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import Image from 'next/image';

const formatCurrency = (amount: number) => {
    return '৳' + new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};


export default function Header() {
  const { isLoggedIn, firebaseUser, appUser, loading } = useAuthContext();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/topup', label: 'Top-Up' },
    { href: '/orders', label: 'My Orders' },
    { href: '/support', label: 'Support' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="https://i.imgur.com/bJH9BH5.png" alt="IHN TOPUP Logo" width={48} height={48} />
              <span className="font-logo text-4xl font-bold text-primary">TOPUP</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
                {navItems.map(item => (
                     <Link
                        href={item.href}
                        key={item.href}
                        className={cn(
                            'text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
                            pathname.startsWith(item.href) && item.href !== '/' || pathname === item.href ? 'text-primary' : ''
                        )}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>


        <div className='flex items-center gap-4'>
            {loading && (
                <div className="flex items-center justify-center h-10 px-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
            )}
            {!loading && isClient && isLoggedIn && firebaseUser ? (
            <>
                <Link href="/wallet" className="flex items-center justify-center h-10 px-4 bg-white hover:bg-gray-50 rounded-full shadow-md transition-colors gap-2">
                    <WalletIcon className="h-6 w-6 text-green-500" />
                    <span className='font-bold text-sm text-gray-800'>{formatCurrency(appUser?.walletBalance ?? 0)}</span>
                </Link>
                <Link href="/profile" passHref>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-white shadow-md">
                      <UserIcon className="h-6 w-6 text-gray-500"/>
                  </Button>
                </Link>
            </>
            ) : !loading && isClient ? (
            <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
            ) : null}
        </div>
      </div>
    </header>
  );
}
