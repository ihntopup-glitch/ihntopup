'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '../ui/badge';
import { HomeIcon, WalletIcon, OrderIcon, UserIcon, CreditCardIcon, SupportIcon } from '@/components/icons';
import { LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const { isLoggedIn } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const loggedInNavItems = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/wallet', label: 'Wallet', icon: WalletIcon },
    { href: '/orders', label: 'My Orders', icon: OrderIcon, badge: cartCount > 0 ? cartCount : null },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  const loggedOutNavItems = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/topup', label: 'Top-Up', icon: CreditCardIcon },
    { href: '/support', label: 'Support', icon: SupportIcon },
    { href: '/login', label: 'Login', icon: LogIn },
  ];

  const navItems = isLoggedIn ? loggedInNavItems : loggedOutNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className={`container mx-auto grid h-20 items-center justify-items-center gap-1 px-2 grid-cols-${navItems.length}`}>
        {navItems.map((item) => {
           const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary w-full',
                isActive && 'text-primary'
              )}
            >
              {item.badge != null && (
                <Badge className="absolute top-1 right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {item.badge}
                </Badge>
              )}
              <item.icon className={cn("h-7 w-7", isActive ? "text-primary" : "text-gray-500")} />
              <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-gray-500")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
