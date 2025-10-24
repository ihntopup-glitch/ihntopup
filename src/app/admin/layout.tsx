'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  Percent,
  Gift,
  PanelLeft,
  ChevronDown,
  Dot,
  ImageIcon,
  Newspaper,
  Headset,
  ArrowLeftRight,
  Settings,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import Image from 'next/image';

const NavItem = ({ href, icon: Icon, children, pathname, onClick }: { href: string, icon: React.ElementType, children: React.ReactNode, pathname: string, onClick?: () => void }) => {
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
};

const CollapsibleNavItem = ({ icon: Icon, title, children, pathname, defaultOpen = false }: { icon: React.ElementType, title: string, children: React.ReactNode, pathname: string, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isActive = React.Children.toArray(children).some(child => {
    if (React.isValidElement(child) && typeof child.props.href === 'string') {
      const href = child.props.href;
      // Ensure exact match for parent paths to avoid conflicts.
      // e.g. /admin/topup should not activate /admin/topup/cards
      if (pathname === href) return true;
      // Allow partial match for child paths
      if (href.split('/').length > 3) return pathname.startsWith(href);
      return false;
    }
    return false;
  });

  useEffect(() => {
    // Automatically open if a child link is active
    const childIsActive = React.Children.toArray(children).some(child => {
       if (React.isValidElement(child) && typeof child.props.href === 'string') {
         return pathname.startsWith(child.props.href);
       }
       return false;
    });
    if (childIsActive) {
      setIsOpen(true);
    }
  }, [pathname, children]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className={cn("flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", isActive && "text-primary")}>
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4" />
            <span>{title}</span>
          </div>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-7 space-y-1 mt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

const SubNavItem = ({ href, children, pathname, onClick }: { href: string, children: React.ReactNode, pathname: string, onClick?: () => void }) => {
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary",
        isActive ? "text-primary bg-muted" : ""
      )}
    >
      <Dot className="h-4 w-4 flex-shrink-0" />
      <span>{children}</span>
    </Link>
  );
};


function SidebarNav({ isMobile = false, onLinkClick }: { isMobile?: boolean, onLinkClick?: () => void }) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile && onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <nav className="grid items-start gap-2 text-sm font-medium">
      <NavItem href="/admin" icon={LayoutDashboard} pathname={pathname} onClick={handleLinkClick}>Dashboard</NavItem>
      
      <CollapsibleNavItem icon={ShoppingBag} title="Orders" pathname={pathname} defaultOpen={pathname.startsWith('/admin/orders')}>
        <SubNavItem href="/admin/orders" pathname={pathname} onClick={handleLinkClick}>All Orders</SubNavItem>
      </CollapsibleNavItem>

      <NavItem href="/admin/users" icon={Users} pathname={pathname} onClick={handleLinkClick}>Users</NavItem>

      <CollapsibleNavItem icon={CreditCard} title="Top-Up" pathname={pathname} defaultOpen={pathname.startsWith('/admin/topup')}>
        <SubNavItem href="/admin/topup/categories" pathname={pathname} onClick={handleLinkClick}>Categories</SubNavItem>
        <SubNavItem href="/admin/topup/cards" pathname={pathname} onClick={handleLinkClick}>Cards</SubNavItem>
      </CollapsibleNavItem>
      
      <CollapsibleNavItem icon={ArrowLeftRight} title="Transactions" pathname={pathname} defaultOpen={pathname.startsWith('/admin/transactions')}>
        <SubNavItem href="/admin/transactions/orders" pathname={pathname} onClick={handleLinkClick}>Order Transactions</SubNavItem>
        <SubNavItem href="/admin/transactions/wallet" pathname={pathname} onClick={handleLinkClick}>Wallet Transactions</SubNavItem>
        <SubNavItem href="/admin/transactions/wallet-requests" pathname={pathname} onClick={handleLinkClick}>Wallet Requests</SubNavItem>
      </CollapsibleNavItem>
      
      <NavItem href="/admin/payment-methods" icon={Wallet} pathname={pathname} onClick={handleLinkClick}>Payment Methods</NavItem>
      <NavItem href="/admin/coupons" icon={Percent} pathname={pathname} onClick={handleLinkClick}>Coupons</NavItem>
      <NavItem href="/admin/banners" icon={ImageIcon} pathname={pathname} onClick={handleLinkClick}>Banners</NavItem>
      <NavItem href="/admin/notices" icon={Newspaper} pathname={pathname} onClick={handleLinkClick}>Notices</NavItem>


      <CollapsibleNavItem icon={Gift} title="Referral System" pathname={pathname} defaultOpen={pathname.startsWith('/admin/referral')}>
        <SubNavItem href="/admin/referral" pathname={pathname} onClick={handleLinkClick}>Referral Settings</SubNavItem>
      </CollapsibleNavItem>
    </nav>
  );
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const { appUser, loading, logout } = useAuthContext();
  const router = useRouter();
  
  useEffect(() => {
    // If loading is finished and there's no user or the user is not an admin, redirect.
    if (!loading && (!appUser || !appUser.isAdmin)) {
      router.push('/');
    }
  }, [appUser, loading, router]);


  // While loading, or if the user is not an admin, show a loader to prevent content flash.
  if (loading || !appUser || !appUser.isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <Image src="https://i.imgur.com/bJH9BH5.png" alt="IHN TOPUP Logo" width={24} height={24} className="h-6 w-6" />
              <span className="">IHN TOPUP Admin</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <SidebarNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
               <SheetHeader className="p-4 border-b">
                 <SheetTitle className="sr-only">Menu</SheetTitle>
                 <Link href="/admin" className="flex items-center gap-2 font-semibold" onClick={() => setIsMobileSheetOpen(false)}>
                  <Image src="https://i.imgur.com/bJH9BH5.png" alt="IHN TOPUP Logo" width={24} height={24} className="h-6 w-6" />
                  <span className="">IHN TOPUP Admin</span>
                </Link>
               </SheetHeader>
              <div className="overflow-auto p-4">
                <SidebarNav isMobile={true} onLinkClick={() => setIsMobileSheetOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={appUser?.photoURL || ''} alt="@shadcn" />
                  <AvatarFallback>{appUser?.name?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
