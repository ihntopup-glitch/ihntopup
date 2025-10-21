'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { Check, Copy, ShieldCheck, User, Wallet, ShoppingBag, Trophy, Pencil, Send, LogOut, ChevronRight, Share2, KeyRound, Headset, Gamepad2, Info, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import SavedUidsCard from '@/components/SavedUidsCard';
import ChangePasswordCard from '@/components/ChangePasswordCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc } from 'firebase/firestore';
import type { User as UserData } from '@/lib/data';
import { useAuthContext } from '@/contexts/AuthContext';

const ActionButton = ({ icon, title, description, href, onClick }: { icon: React.ElementType, title: string, description: string, href?: string, onClick?: () => void }) => {
    const Icon = icon;
    const content = (
        <Card className="shadow-sm hover:bg-muted/50 transition-colors cursor-pointer" onClick={onClick}>
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
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
};

const DialogActionButton = ({ icon, title, description, dialogTitle, children }: { icon: React.ElementType, title: string, description: string, dialogTitle: string, children: React.ReactNode }) => {
    const Icon = icon;
    return (
        <Dialog>
            <DialogTrigger asChild>
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
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl bg-card border-4 border-green-500 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold">{dialogTitle}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
};


export default function ProfilePage() {
  const { user: authUser, logout, loading, isLoggedIn } = useAuthContext();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!authUser?.uid || !firestore) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [authUser?.uid, firestore]);

  const { data: userData, isLoading: userLoading } = useDoc<UserData>(userDocRef);

  useEffect(() => {
    // Only redirect if loading is finished and the user is not logged in.
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [loading, isLoggedIn, router]);
  
  const isLoading = loading || userLoading;

  if (isLoading || !authUser || !userData) {
    return (
        <div className="container mx-auto px-4 py-6 text-center flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  const user = { ...authUser, ...userData };


  return (
    <>
        <div className="container mx-auto px-4 py-6 fade-in space-y-6">
          <div className='flex items-center gap-2'>
            <h1 className="text-3xl font-bold font-headline">My Profile</h1>
            <User className="h-7 w-7 text-blue-500" />
          </div>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 shadow-lg">
            <CardContent className="flex items-center gap-4 p-0">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white/50">
                  {user.photoURL && <AvatarImage asChild src={user.photoURL}><Image src={user.photoURL} alt={user.name || 'User'} width={80} height={80} /></AvatarImage>}
                  <AvatarFallback className="text-3xl bg-white text-primary">{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
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
          </Card>

          <div className="grid grid-cols-2 gap-4">
              <Link href="/wallet">
                <Card className="shadow-md border-l-4 border-green-500">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Wallet className="h-6 w-6 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Wallet</p>
                            <p className="text-lg font-bold">৳{user.walletBalance?.toLocaleString() || '0'}</p>
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
                            <p className="text-lg font-bold">0</p>
                        </div>
                    </CardContent>
                </Card>
              </Link>
          </div>
            
            <div className="space-y-3">
                <DialogActionButton
                    icon={Info}
                    title="Personal Information"
                    description="View and edit your personal details"
                    dialogTitle="Edit Personal Information"
                >
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label htmlFor="name" className='text-sm font-medium'>Full Name</label>
                            <Input id="name" defaultValue={user.name || ''} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className='text-sm font-medium'>Email Address</label>
                            <Input id="email" type="email" defaultValue={user.email || ''} readOnly />
                            <p className='text-xs text-muted-foreground'>Email cannot be changed</p>
                        </div>
                        <div className="space-y-2 relative">
                            <label htmlFor="phone" className='text-sm font-medium'>Phone Number</label>
                            <Input id="phone" type="tel" defaultValue={user.phone || ''} className="pr-10"/>
                             <Button variant="ghost" size="icon" className="absolute right-1 bottom-1 h-8 w-8 bg-green-500 hover:bg-green-600 rounded-full">
                                <Send className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                        <Button className="w-full">Save Changes</Button>
                    </div>
                </DialogActionButton>
                
                <DialogActionButton
                    icon={Gamepad2}
                    title="Saved Game UIDs"
                    description="Manage your game IDs"
                    dialogTitle="Saved Game UIDs"
                >
                    <SavedUidsCard savedUids={user.savedGameUids || []}/>
                </DialogActionButton>

                <ActionButton
                    icon={Share2}
                    title="Refer & Earn"
                    description="Share with friends and earn rewards"
                    href="/refer"
                />

                <DialogActionButton
                    icon={KeyRound}
                    title="Reset Password"
                    description="Change your account password"
                    dialogTitle="Change Password"
                >
                    <ChangePasswordCard />
                </DialogActionButton>

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
    </>
  );
}
