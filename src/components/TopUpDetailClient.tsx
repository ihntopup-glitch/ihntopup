

'use client';

import { useState, useMemo, useEffect } from 'react';
import type { TopUpCardData, Order as OrderType, Coupon, SavedUid, Notice, TopUpCardOption } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, ShoppingCart, Zap, Gem, Info, Loader2, AlertCircle, RefreshCw, Gamepad2, Star, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit, getCountFromServer, doc, updateDoc, writeBatch, runTransaction, getDoc } from 'firebase/firestore';
import ManualPaymentDialog from './ManualPaymentDialog';
import { ProcessingLoader } from './ui/processing-loader';
import { Badge } from './ui/badge';

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

const DescriptionRenderer = ({ description }: { description: string }) => {
    if (!description) return null;
    const points = description.split('\n').filter(line => line.trim() !== '');

    return (
        <ul className="space-y-3">
            {points.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                    <span className="font-semibold text-gray-700">{point}</span>
                </li>
            ))}
        </ul>
    );
};


export default function TopUpDetailClient({ card }: TopUpDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [uid, setUid] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  
  const getInitialOption = () => {
    if (!card.options || card.options.length === 0) return undefined;
    return card.options.find(o => {
        const isManuallyInStock = o.inStock !== false;
        const hasStockLimit = typeof o.stockLimit === 'number' && o.stockLimit > 0;
        if (!hasStockLimit) return isManuallyInStock;
        return isManuallyInStock && (o.stockSoldCount || 0) < o.stockLimit;
    });
  }

  const [selectedOption, setSelectedOption] = useState<TopUpCardOption | undefined>(getInitialOption());
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'instant'>('wallet');
  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isLoggedIn, firebaseUser, appUser } = useAuthContext();
  const router = useRouter();
  const firestore = useFirestore();

  const noticeQuery = useMemoFirebase(
    () => firestore 
      ? query(
          collection(firestore, 'notices'), 
          where('status', '==', 'Active'),
          where('type', '==', 'HowToOrder'),
          limit(1)
        ) 
      : null,
    [firestore]
  );
  
  const { data: notices } = useCollection<Notice>(noticeQuery);
  const howToOrderNotice = useMemo(() => notices?.[0], [notices]);

  const isLimitedStockOffer = useMemo(() => {
    return !!(selectedOption && typeof selectedOption.stockLimit === 'number' && selectedOption.stockLimit > 0);
  }, [selectedOption]);

  useEffect(() => {
    if (isLimitedStockOffer) {
      setPaymentMethod('wallet');
    }
  }, [isLimitedStockOffer]);

  const price = selectedOption ? selectedOption.price : card.price;
  const totalPrice = price * quantity;

  const discount = appliedCoupon ? (appliedCoupon.type === 'Percentage' ? totalPrice * (appliedCoupon.value / 100) : appliedCoupon.value) : 0;
  const finalPrice = Math.max(0, totalPrice - discount);

  const walletBalance = appUser?.walletBalance ?? 0;
  const hasSufficientBalance = walletBalance >= finalPrice;

  const savedUids = appUser?.savedGameUids || [];

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

    if (coupon.totalUsageLimit && coupon.totalUsageLimit > 0) {
        const totalUsageQuery = query(ordersRef, where('couponId', '==', coupon.id));
        const totalUsageSnap = await getCountFromServer(totalUsageQuery);
        if (totalUsageSnap.data().count >= coupon.totalUsageLimit) {
            toast({ variant: 'destructive', title: 'কুপন সীমা শেষ', description: 'এই কুপনটি তার মোট ব্যবহারের সীমা পর্যন্ত পৌঁছেছে।' });
            return;
        }
    }

    const userCouponQuery = query(ordersRef, where('userId', '==', firebaseUser.uid), where('couponId', '==', coupon.id));
    const userCouponSnap = await getDocs(userCouponQuery);

    if (coupon.usageLimitPerUser && userCouponSnap.size >= coupon.usageLimitPerUser) {
        toast({ variant: 'destructive', title: 'কুপন ইতিমধ্যে ব্যবহৃত', description: 'আপনি ইতিমধ্যে এই কুপনের ব্যবহারের সীমা পর্যন্ত পৌঁছেছেন।' });
        return;
    }

    setAppliedCoupon(coupon);
    toast({ title: 'কুপন প্রয়োগ করা হয়েছে!', description: `আপনি ৳${discount.toFixed(2)} ছাড় পেয়েছেন।` });
  }

  const handleOrderNowClick = async () => {
    if (!isLoggedIn) {
        router.push('/login');
        return;
    }
    if (!uid) {
        toast({
            variant: 'destructive',
            title: 'প্রয়োজনীয় তথ্য দিন',
            description: `অর্ডার করার জন্য অনুগ্রহ করে আপনার ${card.serviceType === 'Game' ? 'প্লেয়ার আইডি' : 'লিংক বা নম্বর'} দিন।`,
        });
        return;
    }
    
    if (paymentMethod === 'instant') {
      setIsManualPaymentOpen(true);
    } else if (paymentMethod === 'wallet') {
      if (!hasSufficientBalance) {
        toast({
          variant: 'destructive',
          title: 'অপর্যাপ্ত ব্যালেন্স',
          description: 'আপনার ওয়ালেটে যথেষ্ট টাকা নেই। অনুগ্রহ করে টাকা যোগ করুন।',
        });
        return;
      }
      await handlePayment('Wallet');
    }
  };

  const createOrderObject = (payment: string): Omit<OrderType, 'id'> => {
    return {
        userId: firebaseUser!.uid,
        userName: appUser?.name || firebaseUser?.displayName || 'Unknown User',
        topUpCardId: card.id,
        quantity,
        gameUid: uid,
        paymentMethod: payment,
        totalAmount: finalPrice,
        orderDate: new Date().toISOString(),
        status: 'Pending' as 'Pending',
        productName: card.name,
        productOption: selectedOption?.name || 'Standard',
        couponId: appliedCoupon?.id || null,
        isLimitedStock: isLimitedStockOffer,
    };
  }

  const handlePayment = async (paymentType: 'Wallet' | 'Manual', manualDetails?: any) => {
    if (!isLoggedIn || !firebaseUser || !firestore || !appUser || !selectedOption) return;
    setIsProcessing(true);

    const cardRef = doc(firestore, 'top_up_cards', card.id);
    let proceedError: string | null = null;
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const cardDoc = await transaction.get(cardRef);
            if (!cardDoc.exists()) {
                throw new Error("প্রোডাক্টটি আর উপলব্ধ নেই।");
            }

            if (isLimitedStockOffer) {
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

                const baseQuery = [
                    where('isLimitedStock', '==', true),
                    where('topUpCardId', '==', card.id),
                    where('productOption', '==', selectedOption.name),
                    where('orderDate', '>=', thirtyDaysAgo.toISOString()),
                ];

                const userOrderQuery = query(collection(firestore, 'orders'), where('userId', '==', firebaseUser.uid), ...baseQuery);
                const uidOrderQuery = query(collection(firestore, 'orders'), where('gameUid', '==', uid), ...baseQuery);

                const [userOrdersSnap, uidOrdersSnap] = await Promise.all([
                    getDocs(userOrderQuery),
                    getDocs(uidOrderQuery),
                ]);

                const checkAndSetError = (snap: typeof userOrdersSnap, errorMsgFn: (days: number) => string) => {
                    if (!snap.empty) {
                        const lastOrder = snap.docs[0].data() as OrderType;
                        const lastOrderDate = new Date(lastOrder.orderDate);
                        const nextAvailableDate = new Date(lastOrderDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                        const remainingDays = Math.ceil((nextAvailableDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        
                        if(remainingDays > 0){
                             proceedError = errorMsgFn(remainingDays);
                             return true;
                        }
                    }
                    return false;
                }

                if (checkAndSetError(userOrdersSnap, (days) => `আপনি এই অফারটি আবার ${days} দিন পর নিতে পারবেন।`)) return;
                if (checkAndSetError(uidOrdersSnap, (days) => `এই UID দিয়ে অফারটি আবার ${days} দিন পর নেওয়া যাবে।`)) return;
            }
            
            const currentCardData = cardDoc.data() as TopUpCardData;
            const optionIndex = currentCardData.options?.findIndex(o => o.name === selectedOption.name);
            
            if (optionIndex === -1 || optionIndex === undefined) {
                 throw new Error("নির্বাচিত প্যাকেজটি খুঁজে পাওয়া যায়নি।");
            }

            const currentOption = currentCardData.options![optionIndex];

            // Check stock limit
            const hasStockLimit = typeof currentOption.stockLimit === 'number' && currentOption.stockLimit > 0;
            if (hasStockLimit) {
                const soldCount = currentOption.stockSoldCount || 0;
                if (soldCount >= currentOption.stockLimit!) {
                    throw new Error("দুঃখিত, এই প্যাকেজটির স্টক শেষ হয়ে গেছে।");
                }
                currentCardData.options![optionIndex].stockSoldCount = soldCount + 1;
                transaction.update(cardRef, { options: currentCardData.options });
            }
            
            if (paymentType === 'Wallet') {
              // Deduct from wallet
              const newBalance = walletBalance - finalPrice;
              const userRef = doc(firestore, 'users', firebaseUser.uid);
              transaction.update(userRef, { walletBalance: newBalance });
            }
            
            // Create order
            const orderRef = doc(collection(firestore, 'orders'));
            const orderData = createOrderObject(paymentType);
            if (paymentType === 'Manual' && manualDetails) {
                orderData.manualPaymentDetails = manualDetails;
            }
            transaction.set(orderRef, orderData);
        });

        if (proceedError) {
            toast({ variant: 'destructive', title: 'অর্ডার করা সম্ভব নয়', description: proceedError });
            setIsProcessing(false);
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        toast({
            title: 'অর্ডার সফল হয়েছে!',
            description: 'আপনার অর্ডারটি পর্যালোচনার জন্য পেন্ডিং আছে।',
        });
        router.push('/orders');

    } catch (error: any) {
        console.error(`${paymentType} order failed:`, error);
        toast({
            variant: 'destructive',
            title: 'অর্ডার ব্যর্থ হয়েছে',
            description: error.message || 'আপনার অর্ডার দেওয়ার সময় একটি ত্রুটি হয়েছে।',
        });
    } finally {
        setIsProcessing(false);
        if (paymentType === 'Manual') {
            setIsManualPaymentOpen(false);
        }
    }
  }

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
    if (!selectedOption) {
        toast({
            variant: 'destructive',
            title: 'প্যাকেজ নির্বাচন করুন',
            description: 'কার্টে যোগ করার জন্য অনুগ্রহ করে একটি প্যাকেজ নির্বাচন করুন।',
        });
        return;
    }
    addToCart({ card, quantity, selectedOption });
    toast({
        title: 'কার্টে যোগ করা হয়েছে',
        description: `${quantity} x ${card.name} ${selectedOption ? `(${selectedOption.name})` : ''} আপনার কার্টে যোগ করা হয়েছে।`,
    });
  };

  const hasOptions = card.options && card.options.length > 0;
  
  const uidLabel = card.serviceType === 'Others' ? 'প্রয়োজনীয় তথ্য' : 'প্লেয়ার আইডি';
  const uidPlaceholder = card.serviceType === 'Others' ? 'আপনার লিংক বা নম্বর দিন' : 'প্লেয়ার আইডি লিখুন';

  return (
    <>
    <ProcessingLoader isLoading={isProcessing} message="আপনার অর্ডারটি প্রক্রিয়া করা হচ্ছে..." />
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
          <SectionCard title="রিচার্জ নির্বাচন করুন" step="1">
             <div className={cn(
                "grid gap-3",
                card.serviceType === 'Others' ? 'grid-cols-1' : 'grid-cols-2'
            )}>
              {card.options!.map((option) => {
                const stockLimit = option.stockLimit ?? 0;
                const soldCount = option.stockSoldCount ?? 0;
                const remainingStock = stockLimit - soldCount;
                const hasFiniteStock = typeof stockLimit === 'number' && stockLimit > 0;
                const isOutOfStock = hasFiniteStock && soldCount >= stockLimit;
                const isManuallyOutOfStock = option.inStock === false;
                const isDisabled = isOutOfStock || isManuallyOutOfStock;

                return (
                <button
                  key={option.name}
                  onClick={() => !isDisabled && setSelectedOption(option)}
                  disabled={isDisabled}
                  className={cn(
                    "border-2 rounded-lg p-3 text-left transition-all flex flex-col justify-center",
                    selectedOption?.name === option.name
                      ? "border-primary bg-primary/10"
                      : "border-input bg-background hover:bg-muted",
                    isDisabled && "bg-gray-100 cursor-not-allowed opacity-60"
                  )}
                >
                    <div className="flex justify-between items-center w-full">
                        <span className="font-medium text-xs break-words">{option.name}</span>
                        <span className="font-bold text-primary text-xs ml-2 whitespace-nowrap">৳{option.price}</span>
                    </div>
                    <div className="mt-1">
                        {isDisabled ? (
                             <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">Stock Out</Badge>
                        ) : hasFiniteStock ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-800">{remainingStock} remaining</Badge>
                        ) : null}
                    </div>
                </button>
                )
              })}
            </div>
            {howToOrderNotice?.linkUrl && (
              <div className="mt-4">
                <Link href={howToOrderNotice.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary font-semibold underline">
                  <HelpCircle className="h-4 w-4" />
                  {howToOrderNotice.content || 'কিভাবে অর্ডার করবেন?'}
                </Link>
              </div>
            )}
          </SectionCard>
        )}
        
        <SectionCard title="পরিমাণ নির্বাচন করুন" step={hasOptions ? "২" : "১"}>
            <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </SectionCard>

        <SectionCard title="অ্যাকাউন্ট তথ্য" step={hasOptions ? "৩" : "২"}>
            <div className="space-y-2">
                <Label htmlFor="uid">{uidLabel}</Label>
                <Input id="uid" placeholder={uidPlaceholder} value={uid} onChange={(e) => { setUid(e.target.value); }} />
            </div>
            {savedUids.length > 0 && (
                <div className="mt-3 space-y-2">
                    <Label className="text-xs text-muted-foreground">আপনার সংরক্ষিত আইডি</Label>
                    <div className="flex flex-wrap gap-2">
                        {savedUids.map((saved, index) => (
                            <Button 
                                key={index} 
                                variant="outline" 
                                size="sm" 
                                className="h-auto"
                                onClick={() => setUid(saved.uid)}
                            >
                                <Star className="mr-2 h-4 w-4 text-yellow-400"/>
                                <div>
                                    <p className="font-semibold text-left">{saved.game}</p>
                                    <p className="text-xs text-muted-foreground font-mono">{saved.uid}</p>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="পেমেন্ট নির্বাচন করুন" step={hasOptions ? "৪" : "৩"}>
             <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setPaymentMethod('wallet')}
                    className={cn(
                      'border-2 rounded-lg cursor-pointer transition-all overflow-hidden flex flex-col',
                      paymentMethod === 'wallet' ? 'border-primary' : 'border-input bg-background hover:bg-muted'
                    )}
                  >
                    <div className="relative w-full flex-grow p-4 flex items-center justify-center min-h-[80px]">
                        <Image src="https://i.imgur.com/bJH9BH5.png" alt="My Wallet" layout="fill" className="object-contain p-4"/>
                    </div>
                    <div className={cn(
                        "p-2 text-center w-full text-sm font-semibold",
                         paymentMethod === 'wallet' ? 'bg-primary text-white' : 'bg-muted'
                    )}>
                        My Wallet (৳: {walletBalance.toFixed(0)})
                    </div>
                  </div>
                  <button
                     onClick={() => !isLimitedStockOffer && setPaymentMethod('instant')}
                     disabled={isLimitedStockOffer}
                     className={cn(
                      'border-2 rounded-lg cursor-pointer transition-all overflow-hidden flex flex-col disabled:opacity-50 disabled:cursor-not-allowed',
                      paymentMethod === 'instant' && !isLimitedStockOffer ? 'border-primary' : 'border-input bg-background hover:bg-muted'
                    )}
                  >
                    <div className="relative w-full flex-grow p-4 flex items-center justify-center min-h-[80px]">
                      <Image src="https://i.imgur.com/kUmq3Xe.png" alt="Instant Pay" layout="fill" className="object-contain"/>
                    </div>
                     <div className={cn(
                        "p-2 text-center w-full text-sm font-semibold",
                         paymentMethod === 'instant' && !isLimitedStockOffer ? 'bg-primary text-white' : 'bg-muted'
                    )}>
                        Instant Pay
                    </div>
                  </button>
            </div>
             <div className='mt-4 space-y-2'>
                <div className='flex items-center gap-2 text-sm p-2 rounded-md bg-blue-50 border border-blue-200'>
                    <Info className='h-5 w-5 text-blue-500' />
                    <p>আপনার অ্যাকাউন্ট ব্যালেন্স: <span className='font-bold'>৳{walletBalance.toFixed(2)}</span></p>
                    <button className='ml-auto text-blue-500'><RefreshCw className='h-4 w-4'/></button>
                </div>
                <div className='flex items-center gap-2 text-sm p-2 rounded-md bg-green-50 border border-green-200'>
                    <Info className='h-5 w-5 text-green-500' />
                    <p>প্রোডাক্ট কিনতে আপনার প্রয়োজন: <span className='font-bold'>৳{finalPrice.toFixed(2)}</span></p>
                </div>
            </div>
            {paymentMethod === 'wallet' && !hasSufficientBalance && (
                <div className="mt-3 text-xs text-destructive flex items-center gap-1.5 p-2 bg-destructive/10 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>আপনার ওয়ালেটে যথেষ্ট ব্যালেন্স নেই।</span>
                </div>
            )}
             {isLimitedStockOffer && (
                <div className="mt-3 text-xs text-blue-800 flex items-center gap-1.5 p-2 bg-blue-100 rounded-md">
                    <Info className="h-4 w-4" />
                    <span>এই সীমিত অফারটি শুধুমাত্র ওয়ালেট পেমেন্টের মাধ্যমে可用।</span>
                </div>
            )}
        </SectionCard>
        
        <SectionCard title="বিবরণ">
            <DescriptionRenderer description={card.description} />
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
                    {isLoggedIn ? (
                        <>
                           <Button variant="outline" size="lg" onClick={handleAddToCart} className="text-base" disabled={!selectedOption}>
                                <ShoppingCart className="mr-2" /> কার্টে যোগ করুন
                            </Button>
                            <Button size="lg" onClick={handleOrderNowClick} className="text-base font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" disabled={!selectedOption || isProcessing || (paymentMethod === 'wallet' && !hasSufficientBalance)}>
                                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                এখনই কিনুন
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
      </div>
    </div>

    <ManualPaymentDialog
        open={isManualPaymentOpen}
        onOpenChange={setIsManualPaymentOpen}
        isProcessing={isProcessing}
        onSubmit={handleManualPaymentSubmit}
        totalAmount={finalPrice}
    />
    </>
  );
}
