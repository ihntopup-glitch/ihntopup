
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  Ticket,
  Percent,
  Bell,
  Image as ImageIcon,
  Lock,
  MessageSquare,
  ChevronDown,
  Gift,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  {
    icon: Users,
    label: 'User',
    subItems: [
      { label: 'All Users', href: '/admin/users' },
      { label: 'Verified Users', href: '/admin/users/verified' },
    ],
  },
  { icon: MessageSquare, label: 'Order Message', href: '#' },
  {
    icon: ShoppingBag,
    label: 'Topup',
    subItems: [
      { label: 'Categories', href: '/admin/topup/categories' },
      { label: 'Topup Cards', href: '/admin/topup/cards' },
    ],
  },
  {
    icon: CreditCard,
    label: 'Topup Order',
    subItems: [
      { label: 'All Orders', href: '/admin/orders' },
      { label: 'Pending Orders', href: '/admin/orders/pending' },
    ],
  },
  { icon: Ticket, label: 'Product Order', href: '#' },
  { icon: Lock, label: 'Auths', href: '#' },
  {
    icon: Percent,
    label: 'Coupons',
    subItems: [{ label: 'Manage Coupons', href: '/admin/coupons' }],
  },
  {
    icon: Gift,
    label: 'Referral System',
    subItems: [{ label: 'Referral Settings', href: '/admin/referral' }],
  },
  {
    icon: ImageIcon,
    label: 'Banners',
    subItems: [{ label: 'All Banners', href: '/admin/banners' }],
  },
  {
    icon: Bell,
    label: 'Notice',
    subItems: [{ label: 'Manage Notices', href: '/admin/notices' }],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar>
          <SidebarContent className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
            <SidebarHeader className="border-b dark:border-gray-700">
              <Link href="/admin" className="flex items-center gap-2 p-2">
                <div className="bg-blue-600 p-2 rounded-md">
                  <h1 className="text-xl font-bold text-white">IHN</h1>
                </div>
                <span className="text-xl font-semibold">TOPUP</span>
              </Link>
            </SidebarHeader>
            <SidebarMenu className="flex-1 px-2">
              {menuItems.map((item, index) =>
                item.subItems ? (
                  <Collapsible key={index} className="relative">
                    <CollapsibleTrigger asChild>
                       <SidebarMenuButton
                        className="flex justify-between items-center w-full"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                       <div className="pl-8 pt-1 space-y-1">
                        {item.subItems.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className={cn(
                                "block text-sm py-1.5 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700",
                                pathname === subItem.href && "bg-gray-100 dark:bg-gray-700 font-semibold"
                            )}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton href={item.href} isActive={pathname === item.href} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
       {isClient && <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white dark:bg-gray-800 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-lg font-semibold">ADMIN</h1>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="search"
                placeholder="Search here..."
                className="w-64 hidden md:block"
              />
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </header>
          <main className="p-4 sm:p-6">{children}</main>
        </SidebarInset>}
      </div>
    </SidebarProvider>
  );
}
