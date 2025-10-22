'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { UserCoupon, Referral, User } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowLeft, Copy, Gift, Share2, Ticket, Users, Trophy, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';


export default function ReferPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('referrals');
  const router = useRouter();
  const { appUser, firebaseUser, loading: authLoading } = useAuthContext();
  const firestore = useFirestore();
  const [referredUsersData, setReferredUsersData] = useState<User[]>([]);

  const userCouponsQuery = useMemoFirebase(() => {
    if (!firebaseUser?.uid || !firestore) return null;
    return query(collection(firestore, `users/${firebaseUser.uid}/coupons`));
  }, [firebaseUser?.uid, firestore]);

  const referralsQuery = useMemoFirebase(() => {
    if (!appUser?.id || !firestore) return null;
    return query(collection(firestore, 'referrals'), where('referrerId', '==', appUser.id));
  }, [appUser?.id, firestore]);

  const { data: userCoupons, isLoading: isLoadingCoupons } = useCollection<UserCoupon>(userCouponsQuery);
  const { data: referrals, isLoading: isLoadingReferrals } = useCollection<Referral>(referralsQuery);

  useEffect(() => {
    if (referrals && firestore) {
      const fetchReferredUsers = async () => {
        const userPromises = referrals.map(ref => getDoc(doc(firestore, 'users', ref.refereeId)));
        const userDocs = await Promise.all(userPromises);
        const users = userDocs.map(docSnap => docSnap.data() as User).filter(Boolean);
        setReferredUsersData(users);
      };
      fetchReferredUsers();
    }
  }, [referrals, firestore]);


  const inviteLink = useMemo(() => {
    if (typeof window !== 'undefined' && appUser?.referralCode) {
      return `${window.location.origin}/signup?ref=${appUser.referralCode}`;
    }
    return '';
  }, [appUser?.referralCode]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied!`,
      description: `${text} has been copied to your clipboard.`,
    });
  };

  const handleShare = () => {
    if (!appUser?.referralCode || !inviteLink) return;
    if (navigator.share) {
      navigator.share({
        title: 'Join me on IHN TOPUP!',
        text: `Sign up using my referral code ${appUser.referralCode} and get exciting rewards!`,
        url: inviteLink,
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error);
          copyToClipboard(inviteLink, 'Invite Link');
        }
      });
    } else {
      copyToClipboard(inviteLink, 'Invite Link');
    }
  };

  const handleBuyCoupon = (couponId: string) => {
    toast({
        title: "Coupon Purchased!",
        description: "The coupon has been added to your collection."
    });
  }

  const isLoading = authLoading || isLoadingReferrals;

  if (isLoading && !appUser) {
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
        <Share2 className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Refer & Earn</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-md border-l-4 border-yellow-500">
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-lg font-bold">{appUser?.points || 0}</p> 
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-l-4 border-blue-500">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-lg font-bold">{referrals?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>
        <TabsContent value="referrals">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>Share this link with your friends to earn points.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="referral-code" className="text-sm font-medium">Your Referral Code</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input id="referral-code" value={appUser?.referralCode || '...'} readOnly className="font-mono bg-muted" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(appUser?.referralCode || '', 'Referral Code')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <label htmlFor="invite-link" className="text-sm font-medium">Your Invite Link</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input id="invite-link" value={inviteLink} readOnly className="text-xs bg-muted" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(inviteLink, 'Invite Link')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={handleShare} className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share with Friends
              </Button>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Referred Users</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingReferrals ? (
                  <Loader2 className="animate-spin" />
                ) : referredUsersData.length > 0 ? (
                  <div className="space-y-2">
                    {referredUsersData.map((user, index) => (
                      <div key={user.id} className="p-2 border rounded-lg flex items-center justify-between">
                        <span className="font-medium text-sm">{user.name || 'Unnamed User'}</span>
                        <span className="text-xs text-muted-foreground">{new Date(referrals![index].referralDate).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">You haven't referred anyone yet.</p>
                )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="coupons">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>My Coupons</CardTitle>
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
