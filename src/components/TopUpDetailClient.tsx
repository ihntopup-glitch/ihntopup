'use client';

import { useState, useMemo } from 'react';
import type { TopUpCardData, Order as OrderType, Coupon, PaymentSettings, SavedUid } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, ShoppingCart, Zap, Gem, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CreditCardIcon } from '@/components/icons';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, getDocs, limit, getCountFromServer } from 'firebase/firestore';
import ManualPaymentDialog from './ManualPaymentDialog';

interface TopUpDetailClientProps {
  card: TopUpCardData;
}

const SectionCard: React.FC<{ title: string, step?: string, children: React.ReactNode, className?:string }> = ({ title, step, children, className }) => (
    <Card className={cn("border-l-4 border-green-500 shadow-md", className)}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            {step && <div className="bg-green-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">{step}</div>}
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);


export default function TopUpDetailClient({ card }: TopUpDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [uid, setUid] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [selectedOption, setSelectedOption] = useState(card.options ? card.options[0] : undefined);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isLoggedIn, appUser, firebaseUser } = useAuthContext();
  const router = useRouter();
  const firestore = useFirestore();

  const paymentSettingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'payment') : null, [firestore]);
  const { data: paymentSettings, isLoading: isLoadingPaymentSettings } = useDoc<PaymentSettings>(paymentSettingsRef);
  const isManualMode = paymentSettings?.mode === 'manual';


  const price = selectedOption ? selectedOption.price : card.price;
  const totalPrice = price * quantity;

  const discount = appliedCoupon ? (appliedCoupon.type === 'Percentage' ? totalPrice * (appliedCoupon.value / 100) : appliedCoupon.value) : 0;
  const finalPrice = Math.max(0, totalPrice - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode) {
        toast({ variant: 'destructive', title: "অনুগ্রহ করে একটি কুপন কোড লিখুন।" });
        return;
    }
    if (!firestore || !firebaseUser) return;

    const couponsRef = collection(firestore, 'coupons');
    const q = query(couponsRef, where('code', '==', couponCode), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'অবৈধ কুপন', description: 'এই কুপন কোডটি موجود নেই।' });
        return;
    }
    
    const coupon = { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id } as Coupon;

    // Validation checks
    if (!coupon.isActive) {
        toast({ variant: 'destructive', title: 'নিষ্ক্রিয় কুপন', description: 'এই কুপনটি আর সক্রিয় নেই।' });
        return;
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        toast({ variant: 'destructive', title: 'মেয়াদোত্তীর্ণ কুপন', description: 'এই কুপনের মেয়াদ শেষ হয়ে গেছে।' });
        return;
    }
     if (coupon.minPurchaseAmount && totalPrice < coupon.minPurchaseAmount) {
        toast({ variant: 'destructive', title: 'সর্বনিম্ন ক্রয় পূরণ হয়নি', description: `এই কুপন ব্যবহার করতে আপনাকে কমপক্ষে ৳${coupon.minPurchaseAmount} খরচ করতে হবে।` });
        return;
    }

    const ordersRef = collection(firestore, 'orders');

    // Check total usage limit
    if (coupon.totalUsageLimit && coupon.totalUsageLimit > 0) {
        const totalUsageQuery = query(ordersRef, where('couponId', '==', coupon.id));
        const totalUsageSnap = await getCountFromServer(totalUsageQuery);
        if (totalUsageSnap.data().count >= coupon.totalUsageLimit) {
            toast({ variant: 'destructive', title: 'কুপন সীমা শেষ', description: 'এই কুপনটি তার মোট ব্যবহারের সীমা পর্যন্ত পৌঁছেছে।' });
            return;
        }
    }

    // Check per-user usage limit
    const userCouponQuery = query(ordersRef, where('userId', '==', firebaseUser.uid), where('couponId', '==', coupon.id));
    const userCouponSnap = await getDocs(userCouponQuery);

    if (coupon.usageLimitPerUser && userCouponSnap.size >= coupon.usageLimitPerUser) {
        toast({ variant: 'destructive', title: 'কুপন 이미 ব্যবহৃত', description: 'আপনি 이미 এই কুপনের ব্যবহারের সীমা পর্যন্ত পৌঁছেছেন।' });
        return;
    }

    setAppliedCoupon(coupon);
    toast({ title: 'কুপন প্রয়োগ করা হয়েছে!', description: `আপনি ৳${discount.toFixed(2)} ছাড় পেয়েছেন।` });
  }

  const handleOrderNowClick = () => {
    if (!isLoggedIn) {
        router.push('/login');
        return;
    }
    if (!uid) {
        toast({
            variant: 'destructive',
            title: 'প্লেয়ার আইডি প্রয়োজন',
            description: 'অর্ডার করার জন্য অনুগ্রহ করে আপনার প্লেয়ার আইডি লিখুন।',
        });
        return;
    }

    if (isManualMode) {
      setIsManualPaymentOpen(true);
    } else {
      setIsConfirming(true);
    }
  }

  const handleManualPaymentSubmit = async (details: { senderPhone: string, transactionId: string, method: string }) => {
    if (!isLoggedIn || !firebaseUser || !firestore) {
      toast({ variant: "destructive", title: "অনুমোদন ত্রুটি", description: "অর্ডার করার জন্য আপনাকে অবশ্যই লগইন করতে হবে।" });
      return;
    }

    setIsProcessing(true);
    try {
      const ordersCollectionRef = collection(firestore, 'orders');
      const newOrder: Omit<OrderType, 'id'> = {
          userId: firebaseUser.uid,
          topUpCardId: card.id,
          quantity,
          gameUid: uid,
          paymentMethod: 'Manual',
          totalAmount: finalPrice,
          orderDate: new Date().toISOString(),
          status: 'Pending',
          productName: card.name,
          productOption: selectedOption?.name || 'Standard',
          couponId: appliedCoupon?.id || null,
          manualPaymentDetails: {
            senderPhone: details.senderPhone,
            transactionId: details.transactionId,
            method: details.method,
          }
      };
      await addDocumentNonBlocking(ordersCollectionRef, newOrder);
      toast({
          title: 'অর্ডার সফলভাবে প্লেস করা হয়েছে!',
          description: 'আপনার অর্ডারটি পর্যালোচনার জন্য পেন্ডিং আছে।',
      });
      router.push('/orders');
    } catch (error) {
      console.error("Manual order failed:", error);
      toast({
          variant: 'destructive',
          title: 'অর্ডার ব্যর্থ হয়েছে',
          description: 'আপনার অর্ডার দেওয়ার সময় একটি ত্রুটি হয়েছে।',
      });
    } finally {
      setIsProcessing(false);
      setIsManualPaymentOpen(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!isLoggedIn || !firebaseUser || !firestore) {
        toast({ variant: "destructive", title: "অনুমোদন ত্রুটি", description: "অর্ডার করার জন্য আপনাকে অবশ্যই লগইন করতে হবে।" });
        setIsConfirming(false);
        return;
    }

    if (paymentMethod === 'wallet') {
        const currentBalance = appUser?.walletBalance ?? 0;
        if (currentBalance < finalPrice) {
            toast({
                variant: 'destructive',
                title: 'অপর্যাপ্ত ব্যালেন্স',
                description: 'এই ক্রয়টি সম্পন্ন করতে অনুগ্রহ করে আপনার ওয়ালেটে টাকা যোগ করুন।',
            });
            setIsConfirming(false);
            return;
        }

        setIsProcessing(true);

        try {
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            const ordersCollectionRef = collection(firestore, 'orders');
            
            const newOrder: Omit<OrderType, 'id'> = {
                userId: firebaseUser.uid,
                topUpCardId: card.id,
                quantity,
                gameUid: uid,
                paymentMethod: 'Wallet',
                totalAmount: finalPrice,
                orderDate: new Date().toISOString(),
                status: 'Pending',
                productName: card.name,
                productOption: selectedOption?.name || 'Standard',
                couponId: appliedCoupon?.id || null
            };
            
            await updateDocumentNonBlocking(userDocRef, {
                walletBalance: currentBalance - finalPrice
            });
            await addDocumentNonBlocking(ordersCollectionRef, newOrder);
            
            toast({
                title: 'অর্ডার সফলভাবে প্লেস করা হয়েছে!',
                description: 'আপনার অর্ডারটি এখন পেন্ডিং আছে।',
            });

            router.push('/orders');

        } catch (error) {
            console.error("Order placement failed:", error);
            toast({
                variant: 'destructive',
                title: 'অর্ডার ব্যর্থ হয়েছে',
                description: 'আপনার অর্ডার দেওয়ার সময় একটি ত্রুটি হয়েছে। অনুগ্রহ করে সাপোর্টে যোগাযোগ করুন।',
            });
        } finally {
            setIsProcessing(false);
            setIsConfirming(false);
        }
    } else {
      // Logic for other automatic payment gateways would go here
      toast({ title: "প্রসেসিং হচ্ছে...", description: "আপনাকে পেমেন্ট গেটওয়েতে নিয়ে যাওয়া হচ্ছে।" });
      setIsConfirming(false);
    }
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
        const loginButton = document.getElementById('login-button');
        if (loginButton) {
            loginButton.click();
        } else {
            router.push('/login');
        }
        return;
    }
    addToCart({ card, quantity, selectedOption });
    toast({
        title: 'কার্টে যোগ করা হয়েছে',
        description: `${quantity} x ${card.name} ${selectedOption ? `(${selectedOption.name})` : ''} আপনার কার্টে যোগ করা হয়েছে।`,
    });
  };

  const hasOptions = card.options && card.options.length > 0;

  return (
    <>
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      <div className="space-y-8">
        
        <Card className="shadow-lg overflow-hidden">
            <CardContent className="flex items-center gap-4 p-4">
                <div className="relative h-24 w-24 flex-shrink-0">
                    <Image 
                        src={card.image.src} 
                        alt={card.name} 
                        fill 
                        className="object-cover rounded-lg" 
                        data-ai-hint={card.image.hint} 
                    />
                </div>
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold font-headline">{card.name}</h1>
                    <p className="text-sm text-muted-foreground">গেম / টপ-আপ</p>
                </div>
            </CardContent>
        </Card>

        {hasOptions && (
          <SectionCard title="রিচার্জ নির্বাচন করুন" step="১">
            <div className="grid grid-cols-2 gap-3">
              {card.options!.map((option) => (
                <button
                  key={option.name}
                  onClick={() => setSelectedOption(option)}
                  className={cn(
                    "border-2 rounded-lg p-3 text-left transition-all",
                    "flex justify-between items-center",
                    selectedOption?.name === option.name
                      ? "border-primary bg-primary/10"
                      : "border-input bg-background hover:bg-muted"
                  )}
                >
                  <span className="font-medium text-sm flex items-center gap-1.5">
                    <Gem className="h-4 w-4 text-blue-400" /> {option.name}
                  </span>
                  <span className="font-bold text-primary text-sm">৳{option.price}</span>
                </button>
              ))}
            </div>
          </SectionCard>
        )}

      </div>

      <div className="space-y-6">

        <SectionCard title="অ্যাকাউন্ট তথ্য" step={hasOptions ? "২" : "১"}>
            <div className="space-y-2">
                <Label htmlFor="uid">প্লেয়ার আইডি</Label>
                <Input id="uid" placeholder="প্লেয়ার আইডি লিখুন" value={uid} onChange={(e) => { setUid(e.target.value); }} />
            </div>
        </SectionCard>

        <SectionCard title="পরিমাণ" step={hasOptions ? "৩" : "২"}>
            <div className="flex items-center gap-4 justify-center">
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
                </Button>
                <span className="w-16 text-center font-bold text-2xl">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-4 w-4" />
                </Button>
            </div>
        </SectionCard>

        <SectionCard title="পেমেন্ট নির্বাচন করুন" step={hasOptions ? "৪" : "৩"}>
          <RadioGroup defaultValue="wallet" className="mt-2 grid grid-cols-2 gap-4" onValueChange={setPaymentMethod}>
            <div>
              <RadioGroupItem value="wallet" id="wallet" className="peer sr-only" />
              <Label htmlFor="wallet" className="flex flex-col text-center items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <Zap className="h-6 w-6 mb-2" />
                তাত্ক্ষণিক পে (ওয়ালেট)
              </Label>
            </div>
            <div>
              <RadioGroupItem value="gateway" id="gateway" className="peer sr-only" disabled={!isManualMode} />
              <Label htmlFor="gateway" className={cn("flex flex-col text-center items-center justify-center rounded-md border-2 border-muted bg-popover p-4", isManualMode ? "hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary" : "opacity-50 cursor-not-allowed")}>
                <CreditCardIcon className="h-6 w-6 mb-2" />
                পেমেন্ট গেটওয়ে
              </Label>
            </div>
          </RadioGroup>
            <Alert className="mt-4 border-blue-500 text-blue-800">
                <Info className="h-4 w-4 !text-blue-500" />
                <AlertDescription className="text-sm">
                    আপনার অ্যাকাউন্ট ব্যালেন্স ৳{appUser?.walletBalance?.toFixed(2) || '0.00'}
                </AlertDescription>
            </Alert>
            <Alert className="mt-2 border-orange-500 text-orange-800">
                <Info className="h-4 w-4 !text-orange-500" />
                <AlertDescription className="text-sm">
                    প্রোডাক্ট কিনতে আপনার প্রয়োজন ৳{finalPrice.toFixed(2)}
                </AlertDescription>
            </Alert>
        </SectionCard>
        
        <Card className="shadow-md">
            <CardContent className="pt-6">
                <div className="flex gap-2 mb-4">
                    <Input placeholder="কুপন কোড" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                    <Button variant="outline" onClick={handleApplyCoupon}>প্রয়োগ</Button>
                </div>

                <Separator />

                <div className="space-y-2 mt-4">
                    <div className="flex justify-between">
                        <span>{selectedOption ? selectedOption.name : card.name} x {quantity}</span>
                        <span>৳{totalPrice.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>ডিসকাউন্ট</span>
                            <span>-৳{discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                        <span>মোট</span>
                        <span>৳{finalPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-6">
                    {isLoadingPaymentSettings ? (
                        <Button size="lg" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            লোড হচ্ছে...
                        </Button>
                    ) : isLoggedIn ? (
                        <>
                           <Button variant="outline" size="lg" onClick={handleAddToCart} className="text-base">
                                <ShoppingCart className="mr-2" /> কার্টে যোগ করুন
                            </Button>
                            <Button size="lg" onClick={handleOrderNowClick} className="text-base font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                                <Zap className="mr-2" /> এখনই কিনুন
                            </Button>
                        </>
                    ) : (
                        <Button id="login-button" size="lg" onClick={() => router.push('/login')} className="text-base font-bold">
                            অর্ডার করতে লগইন করুন
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
        <SectionCard title="বিবরণ" className="mt-8">
             <p className='text-muted-foreground text-sm'>{card.description}</p>
        </SectionCard>

      </div>
    </div>

    <ManualPaymentDialog
        open={isManualPaymentOpen}
        onOpenChange={setIsManualPaymentOpen}
        isProcessing={isProcessing}
        onSubmit={handleManualPaymentSubmit}
        totalAmount={finalPrice}
    />

    <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>আপনার অর্ডার নিশ্চিত করুন</AlertDialogTitle>
                <AlertDialogDescription>
                    নিশ্চিত করার আগে অনুগ্রহ করে আপনার অর্ডারের বিস্তারিত পর্যালোচনা করুন।
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">আইটেম:</span>
                    <span className="font-semibold">{card.name} - {selectedOption?.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">প্লেয়ার আইডি:</span>
                    <span className="font-semibold font-mono">{uid}</span>
                </div>
                 {appliedCoupon && (
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">কুপন প্রয়োগ করা হয়েছে:</span>
                        <span className="font-semibold">{appliedCoupon.code}</span>
                    </div>
                 )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                    <span>মোট পরিমাণ:</span>
                    <span>৳{finalPrice.toFixed(2)}</span>
                </div>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>বাতিল</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmOrder} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    অর্ডার নিশ্চিত করুন
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
