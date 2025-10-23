'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { UserCoupon } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowLeft, Copy, Ticket, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';


export default function CouponsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuthContext();
  const firestore = useFirestore();

  const userCouponsQuery = useMemoFirebase(() => {
    if (!firebaseUser?.uid || !firestore) return null;
    return query(collection(firestore, `users/${firebaseUser.uid}/coupons`));
  }, [firebaseUser?.uid, firestore]);

  const { data: userCoupons, isLoading: isLoadingCoupons } = useCollection<UserCoupon>(userCouponsQuery);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied!`,
      description: `${text} has been copied to your clipboard.`,
    });
  };

  const handleBuyCoupon = (couponId: string) => {
    toast({
        title: "Coupon Purchased!",
        description: "The coupon has been added to your collection."
    });
  }

  const isLoading = authLoading || isLoadingCoupons;

  if (isLoading && !userCoupons) {
    return (
        <div className="container mx-auto px-4 py-6 text-center flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 fade-in space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <Ticket className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold font-headline">My Coupons</h1>
      </div>

      <Tabs defaultValue="my-coupons" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-coupons">My Coupons</TabsTrigger>
          <TabsTrigger value="store">Coupon Store</TabsTrigger>
        </TabsList>
        <TabsContent value="my-coupons">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Available Coupons</CardTitle>
                    <CardDescription>Coupons you have earned or purchased.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoadingCoupons ? (
                         <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         </div>
                    ) : userCoupons && userCoupons.length > 0 ? (
                        userCoupons.map((coupon: UserCoupon) => (
                            <div key={coupon.id} className="flex items-center justify-between p-4 rounded-lg bg-muted border">
                                <div className="flex items-center gap-4">
                                    <Ticket className="h-8 w-8 text-primary" />
                                    <div>
                                        <h4 className="font-bold">{coupon.code}</h4>
                                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => copyToClipboard(coupon.code, "Coupon Code")}>Copy</Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">You don't have any coupons yet.</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="store">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Coupon Store</CardTitle>
                    <CardDescription>Use your points to buy valuable coupons.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-center py-4">The coupon store is currently empty.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
