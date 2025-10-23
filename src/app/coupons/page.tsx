'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { UserCoupon, Coupon } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowLeft, Copy, Ticket, Loader2, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, runTransaction } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function CouponsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { firebaseUser, appUser, loading: authLoading } = useAuthContext();
  const firestore = useFirestore();

  const userCouponsQuery = useMemoFirebase(() => {
    if (!firebaseUser?.uid || !firestore) return null;
    return query(collection(firestore, `users/${firebaseUser.uid}/coupons`));
  }, [firebaseUser?.uid, firestore]);

  const storeCouponsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'coupons'), where('isStoreVisible', '==', true));
  }, [firestore]);

  const { data: userCoupons, isLoading: isLoadingUserCoupons } = useCollection<UserCoupon>(userCouponsQuery);
  const { data: storeCoupons, isLoading: isLoadingStoreCoupons } = useCollection<Coupon>(storeCouponsQuery);

  const [isClaiming, setIsClaiming] = useState<Record<string, boolean>>({});

  const userClaimedCodes = useMemo(() => userCoupons?.map(c => c.code) || [], [userCoupons]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} কপি করা হয়েছে!`,
      description: `${text} আপনার ক্লিপবোর্ডে কপি করা হয়েছে।`,
    });
  };

  const handleClaimCoupon = async (coupon: Coupon) => {
    if (!firestore || !firebaseUser) {
        toast({ variant: 'destructive', title: 'আপনাকে অবশ্যই লগইন করতে হবে।' });
        return;
    }
    
    setIsClaiming(prev => ({...prev, [coupon.id]: true}));
    
    const couponRef = doc(firestore, 'coupons', coupon.id);
    const userCouponRef = doc(collection(firestore, `users/${firebaseUser.uid}/coupons`));

    try {
        await runTransaction(firestore, async (transaction) => {
            const couponDoc = await transaction.get(couponRef);
            if (!couponDoc.exists()) {
                throw new Error("কুপনটি আর উপলব্ধ নেই।");
            }
            
            const currentCoupon = couponDoc.data() as Coupon;
            
            if (currentCoupon.claimLimit && currentCoupon.claimedCount >= currentCoupon.claimLimit) {
                throw new Error("দুঃখিত, এই কুপনটির ক্লেইম সীমা পূর্ণ হয়ে গেছে।");
            }

            if (userClaimedCodes.includes(currentCoupon.code)) {
                throw new Error("আপনি ইতিমধ্যে এই কুপনটি সংগ্রহ করেছেন।");
            }

            transaction.update(couponRef, { claimedCount: (currentCoupon.claimedCount || 0) + 1 });
            
            const newUserCoupon: Omit<UserCoupon, 'id'> = {
                code: currentCoupon.code,
                description: currentCoupon.name,
                acquiredDate: new Date().toISOString(),
            };
            transaction.set(userCouponRef, newUserCoupon);
        });

        toast({
            title: "কুপন সংগ্রহ করা হয়েছে!",
            description: `"${coupon.name}" আপনার সংগ্রহে যোগ করা হয়েছে।`
        });
        
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: "ক্লেইম ব্যর্থ হয়েছে",
            description: error.message || "একটি অজানা ত্রুটি ঘটেছে।"
        });
    } finally {
        setIsClaiming(prev => ({...prev, [coupon.id]: false}));
    }
  }


  const isLoading = authLoading || isLoadingUserCoupons || isLoadingStoreCoupons;

  if (isLoading && !userCoupons && !storeCoupons) {
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
        <h1 className="text-3xl font-bold font-headline">আমার কুপন</h1>
      </div>

      <Tabs defaultValue="my-coupons" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-coupons">আমার কুপন</TabsTrigger>
          <TabsTrigger value="store">কুপন স্টোর</TabsTrigger>
        </TabsList>
        <TabsContent value="my-coupons">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>উপলব্ধ কুপন</CardTitle>
                    <CardDescription>আপনার অর্জিত বা কেনা কুপনসমূহ।</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoadingUserCoupons ? (
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
                                <Button size="sm" onClick={() => copyToClipboard(coupon.code, "কুপন কোড")}>কপি</Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">আপনার এখনো কোনো কুপন নেই।</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="store">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>কুপন স্টোর</CardTitle>
                    <CardDescription>এখান থেকে বিনামূল্যে কুপন সংগ্রহ করুন।</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {isLoadingStoreCoupons ? (
                         <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         </div>
                    ) : storeCoupons && storeCoupons.length > 0 ? (
                       <div className="grid md:grid-cols-2 gap-4">
                         {storeCoupons.map((coupon) => {
                            const isClaimed = userClaimedCodes.includes(coupon.code);
                            const isLimitReached = coupon.claimLimit != null && coupon.claimedCount >= coupon.claimLimit;
                            const canClaim = !isClaimed && !isLimitReached;

                           return (
                            <div key={coupon.id} className="flex items-center justify-between p-4 rounded-lg bg-muted border">
                                <div className="flex items-center gap-4">
                                    <Gift className="h-8 w-8 text-primary" />
                                    <div>
                                        <h4 className="font-bold">{coupon.name}</h4>
                                        <p className="text-sm text-muted-foreground">কোড: <span className='font-mono'>{coupon.code}</span></p>
                                        {coupon.claimLimit != null && <p className="text-xs text-muted-foreground">বাকি আছে: {coupon.claimLimit - coupon.claimedCount} টি</p>}
                                    </div>
                                </div>
                                <Button 
                                    size="sm" 
                                    onClick={() => handleClaimCoupon(coupon)}
                                    disabled={!canClaim || isClaiming[coupon.id]}
                                >
                                    {isClaiming[coupon.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isClaimed ? "সংগ্রহীত" : isLimitReached ? "শেষ" : "ক্লেইম করুন"}
                                </Button>
                            </div>
                           )
                         })}
                       </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">কুপন স্টোর বর্তমানে খালি আছে।</p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

  