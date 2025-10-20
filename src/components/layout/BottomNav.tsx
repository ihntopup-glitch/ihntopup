'use client';

import { useAuth } from '@/hooks/useAuth';
import { Home, Wallet, Package, User, LifeBuoy, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '../ui/badge';

export default function BottomNav() {
  const { isLoggedIn } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();

  const loggedInNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/wallet', label: 'Wallet', icon: Wallet },
    { href: '/orders', label: 'My Orders', icon: Package, badge: cartCount > 0 ? cartCount : undefined },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const loggedOutNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/topup', label: 'Top-Up', icon: CreditCard },
    { href: '/support', label: 'Support', icon: LifeBuoy },
  ];

  const navItems = isLoggedIn ? loggedInNavItems : loggedOutNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <div className={`container mx-auto grid h-20 items-center justify-items-center gap-1 px-2 grid-cols-${navItems.length}`}>
        {navItems.map((item) => {
           const isActive = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 rounded-lg p-2 text-muted-foreground transition-colors hover:text-primary w-full',
                isActive && 'text-primary'
              )}
            >
              {item.badge && (
                <Badge className="absolute top-1 right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {item.badge}
                </Badge>
              )}
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
