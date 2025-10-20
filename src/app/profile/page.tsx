'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { userProfile, orders, walletData } from '@/lib/data';
import { Check, Copy, ShieldCheck, User, Wallet, ShoppingBag, Trophy, Pencil, Send, LogOut, ChevronRight, Share2, KeyRound, Headset } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import SavedUidsCard from '@/components/SavedUidsCard';
import ChangePasswordCard from '@/components/ChangePasswordCard';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const ActionButton = ({ icon, title, description, href }: { icon: React.ElementType, title: string, description: string, href: string }) => {
    const Icon = icon;
    return (
        <Link href={href}>
            <Card className="shadow-sm hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
            </Card>
        </Link>
    );
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return (
        <div className="container mx-auto px-4 py-6 text-center">
            <p>Please log in to view your profile.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 fade-in space-y-6">
      <div className='flex items-center gap-2'>
        <h1 className="text-3xl font-bold font-headline">My Profile</h1>
        <User className="h-7 w-7 text-blue-500" />
      </div>

      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 shadow-lg">
        <CardContent className="flex items-center gap-4 p-0">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-white/50">
              <AvatarImage asChild src={user.avatar.src}>
                  <Image src={user.avatar.src} alt={user.name} width={80} height={80} data-ai-hint={user.avatar.hint} />
              </AvatarImage>
              <AvatarFallback className="text-3xl bg-white text-primary">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
             <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                <User className="h-4 w-4 text-green-500"/>
            </div>
          </div>
          <div className='space-y-1'>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-sm text-white/90">{user.email}</p>
            <Badge className='bg-blue-500 text-white hover:bg-blue-600'>
              <Trophy className="h-4 w-4 mr-1" />
              Diamond Member
            </Badge>
          </div>
        </CardContent>
         <div className="mt-4">
            <Button variant="secondary" className="w-full bg-white text-green-600 hover:bg-gray-100">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
            </Button>
         </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
          <Link href="/wallet">
            <Card className="shadow-md border-l-4 border-green-500">
                <CardContent className="p-4 flex items-center gap-3">
                    <Wallet className="h-6 w-6 text-green-500" />
                    <div>
                        <p className="text-sm text-muted-foreground">Wallet</p>
                        <p className="text-lg font-bold">৳{walletData.balance.toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>
          </Link>
           <Link href="/orders">
            <Card className="shadow-md border-l-4 border-purple-500">
                <CardContent className="p-4 flex items-center gap-3">
                    <ShoppingBag className="h-6 w-6 text-purple-500" />
                    <div>
                        <p className="text-sm text-muted-foreground">Orders</p>
                        <p className="text-lg font-bold">{orders.length}</p>
                    </div>
                </CardContent>
            </Card>
          </Link>
      </div>

       <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="name" className='text-sm font-medium'>Full Name</label>
                    <Input id="name" defaultValue={user.name} />
                </div>
                <div className="space-y-1">
                    <label htmlFor="email" className='text-sm font-medium'>Email Address</label>
                    <Input id="email" type="email" defaultValue={user.email} readOnly />
                    <p className='text-xs text-muted-foreground'>Email cannot be changed</p>
                </div>
                <div className="space-y-1 relative">
                    <label htmlFor="phone" className='text-sm font-medium'>Phone Number</label>
                    <Input id="phone" type="tel" defaultValue={userProfile.phone} className="pr-10"/>
                     <Button variant="ghost" size="icon" className="absolute right-1 bottom-1 h-8 w-8 bg-green-500 hover:bg-green-600 rounded-full">
                        <Send className="h-4 w-4 text-white" />
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        <SavedUidsCard />

        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>Refer & Earn</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-3 text-center p-4 border-2 border-dashed rounded-lg">
                    <Share2 className="h-8 w-8 text-primary" />
                    <p className="font-semibold">Share your referral code and earn rewards!</p>
                    <div className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                        <span className="font-mono text-lg font-bold text-primary">{userProfile.referralCode}</span>
                        <Button variant="ghost" size="icon">
                            <Copy className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="space-y-3">
            <ActionButton 
                icon={KeyRound}
                title="Reset Password"
                description="Change your account password"
                href="#"
            />
            <ActionButton 
                icon={Headset}
                title="Support"
                description="Get help from our team"
                href="/support"
            />
        </div>

        <Button variant="destructive" className="w-full text-lg py-6 bg-red-600 hover:bg-red-700" onClick={logout}>
            <LogOut className="mr-2 h-5 w-5" />
            Logout
        </Button>

    </div>
  );
}
