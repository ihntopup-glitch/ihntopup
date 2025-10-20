'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { userProfile } from '@/lib/data';
import { Check, Copy, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import SavedUidsCard from '@/components/SavedUidsCard';
import ChangePasswordCard from '@/components/ChangePasswordCard';

export default function ProfilePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if(navigator.clipboard) {
        navigator.clipboard.writeText(userProfile.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user) {
    return (
        <div className="container mx-auto px-4 py-6 text-center">
            <p>Please log in to view your profile.</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 fade-in">
      <h1 className="text-3xl font-bold font-headline mb-6">My Profile</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
            <Card className="flex flex-col items-center justify-center p-6 text-center">
                <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage asChild src={user.avatar.src}>
                        <Image src={user.avatar.src} alt={user.name} width={96} height={96} data-ai-hint={user.avatar.hint} />
                    </AvatarImage>
                    <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <div className='flex items-center gap-2'>
                    <p className="text-muted-foreground">{user.email}</p>
                    {userProfile.isVerified && <ShieldCheck className="h-5 w-5 text-primary" />}
                </div>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Referral Program</CardTitle>
                    <CardDescription>Share your code and earn rewards!</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-2 text-sm font-medium">Your unique referral code:</p>
                    <div className="flex items-center gap-2">
                    <Input readOnly value={userProfile.referralCode} className="font-mono text-lg" />
                    <Button variant="outline" size="icon" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name">Name</label>
                        <Input id="name" defaultValue={user.name} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email">Email</label>
                        <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="phone">Phone</label>
                        <Input id="phone" type="tel" defaultValue={userProfile.phone} />
                    </div>
                    <Button className="bg-primary hover:bg-accent">Save Changes</Button>
                </CardContent>
            </Card>
            <SavedUidsCard />
            <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}
