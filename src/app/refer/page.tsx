'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { referralData, availableCoupons, userCoupons } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Copy, Gift, Share2, Ticket, Users, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function ReferPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('referrals');

  const inviteLink = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/signup?ref=${referralData.referralCode}`;
    }
    return `https://ihntopup.com/signup?ref=${referralData.referralCode}`;
  }, [referralData.referralCode]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied!`,
      description: `${text} has been copied to your clipboard.`,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on IHN TOPUP!',
        text: `Sign up using my referral code ${referralData.referralCode} and get exciting rewards!`,
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
    // This is a mock function. In a real app, you would handle the logic
    // to deduct points and add the coupon to the user's account.
    toast({
        title: "Coupon Purchased!",
        description: "The coupon has been added to your collection."
    });
  }

  return (
    <div className="container mx-auto px-4 py-6 fade-in space-y-6">
      <div className="flex items-center gap-2">
        <Share2 className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold font-headline">Refer & Earn</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-md border-l-4 border-yellow-500">
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-lg font-bold">{referralData.points}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-l-4 border-blue-500">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-lg font-bold">{referralData.referredUsers.length}</p>
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
                  <Input id="referral-code" value={referralData.referralCode} readOnly className="font-mono bg-muted" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralData.referralCode, 'Referral Code')}>
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
              {referralData.referredUsers.length > 0 ? (
                <ul className="space-y-2">
                  {referralData.referredUsers.map((user, index) => (
                    <li key={index} className="flex justify-between items-center bg-muted p-2 rounded-md">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.date}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center">You haven't referred anyone yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="coupons">
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Coupon Store</CardTitle>
                    <CardDescription>Use your points to buy valuable coupons.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {availableCoupons.map(coupon => (
                        <Card key={coupon.id} className="flex items-center p-4 justify-between">
                            <div className='flex items-center gap-4'>
                                <Gift className="h-8 w-8 text-primary" />
                                <div>
                                    <h4 className="font-semibold">{coupon.title}</h4>
                                    <p className="text-sm text-muted-foreground">{coupon.description}</p>
                                </div>
                            </div>
                            <Button 
                                onClick={() => handleBuyCoupon(coupon.id)}
                                disabled={referralData.points < coupon.pointsRequired}
                            >
                                {coupon.pointsRequired} Points
                            </Button>
                        </Card>
                    ))}
                </CardContent>
            </Card>
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle>My Coupons</CardTitle>
                    <CardDescription>The coupons you have purchased.</CardDescription>
                </CardHeader>
                <CardContent>
                {userCoupons.length > 0 ? (
                    <ul className="space-y-3">
                    {userCoupons.map((coupon) => (
                        <li key={coupon.id} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border-l-4 border-green-500">
                            <div className='flex items-center gap-3'>
                                <Ticket className='h-6 w-6 text-green-600' />
                                <div>
                                    <p className="font-semibold text-base">{coupon.code}</p>
                                    <p className="text-xs text-muted-foreground">{coupon.description}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(coupon.code, 'Coupon Code')}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </Button>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">You don't have any coupons yet. Purchase one from the store!</p>
                )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
