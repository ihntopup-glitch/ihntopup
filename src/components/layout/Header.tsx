'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { CreditCard, ShoppingCart, Wallet } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { isLoggedIn, user, login, logout } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();

  const navItems = [
      { href: '/topup', label: 'Top-Up' },
      { href: '/support', label: 'Support' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-headline text-foreground">
                IHN TOPUP
            </h1>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
                {navItems.map(item => (
                     <Link
                        href={item.href}
                        key={item.href}
                        className={cn(
                            'text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
                            pathname.startsWith(item.href) && 'text-primary'
                        )}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </div>


        <div className='flex items-center gap-4'>
            {isLoggedIn && user ? (
            <>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/orders" className='relative'>
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{cartCount}</span>}
                        <span className='sr-only'>Cart</span>
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                     <Link href="/wallet">
                        <Wallet className="h-5 w-5" />
                        <span className='sr-only'>Wallet</span>
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                        <AvatarImage asChild src={user.avatar.src}>
                            <Image src={user.avatar.src} alt={user.name} width={40} height={40} data-ai-hint={user.avatar.hint}/>
                        </AvatarImage>
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/wallet">Wallet</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                        Log out
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
            ) : (
            <Button onClick={login}>Log In</Button>
            )}
        </div>
      </div>
    </header>
  );
}
