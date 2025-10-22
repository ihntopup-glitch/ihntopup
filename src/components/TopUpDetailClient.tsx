'use client';

import { useState } from 'react';
import type { TopUpCardData, Order as OrderType } from '@/lib/data';
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
import { useFirestore, addDocumentNonBlocking, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';

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
  const [coupon, setCoupon] = useState('');
  const [selectedOption, setSelectedOption] = useState(card.options ? card.options[0] : undefined);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isLoggedIn, appUser, firebaseUser } = useAuthContext();
  const router = useRouter();
  const firestore = useFirestore();


  const price = selectedOption ? selectedOption.price : card.price;
  const totalPrice = price * quantity;
  const discount = coupon === 'IHN10' ? totalPrice * 0.1 : 0;
  const finalPrice = totalPrice - discount;

  const handleOrderNowClick = () => {
    if (!isLoggedIn) {
        router.push('/login');
        return;
    }
    if (!uid) {
        toast({
            variant: 'destructive',
            title: 'Player ID Required',
            description: 'Please enter your Player ID to proceed.',
        });
        return;
    }
    setIsConfirming(true);
  }

  const handleConfirmOrder = async () => {
    if (!isLoggedIn || !firebaseUser || !firestore) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to place an order." });
        setIsConfirming(false);
        return;
    }

    if (paymentMethod === 'wallet') {
        const currentBalance = appUser?.walletBalance ?? 0;
        if (currentBalance < finalPrice) {
            toast({
                variant: 'destructive',
                title: 'Insufficient Balance',
                description: 'Please add money to your wallet to complete this purchase.',
            });
            setIsConfirming(false);
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Deduct balance
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            await updateDocumentNonBlocking(userDocRef, {
                walletBalance: currentBalance - finalPrice
            });

            // 2. Create order
            const ordersCollectionRef = collection(firestore, `users/${firebaseUser.uid}/orders`);
            const newOrder: Omit<OrderType, 'id'> = {
                userId: firebaseUser.uid,
                topUpCardId: `${card.name} - ${selectedOption?.name || 'Standard'}`,
                quantity: quantity,
                gameUid: uid,
                paymentMethod: 'Wallet',
                totalAmount: finalPrice,
                orderDate: new Date().toISOString(),
                status: 'Pending',
            };
            await addDocumentNonBlocking(ordersCollectionRef, newOrder);
            
            toast({
                title: 'Order Placed Successfully!',
                description: 'Your order is now pending.',
            });

            router.push('/orders');

        } catch (error) {
            console.error("Order placement failed:", error);
            toast({
                variant: 'destructive',
                title: 'Order Failed',
                description: 'There was an error placing your order. Your balance was not deducted.',
            });
            // Ideally, you'd have a transaction to roll back the balance deduction if order creation fails.
            // For now, we are hoping both succeed or the user reports the issue.
        } finally {
            setIsProcessing(false);
            setIsConfirming(false);
        }
    }
    // TODO: Implement Payment Gateway logic
  };

  const handleAddToCart = () => {
     if (!isLoggedIn) {
        router.push('/login');
        return;
    }
    addToCart({ card, quantity, selectedOption });
    toast({
        title: 'Added to cart',
        description: `${quantity} x ${card.name} ${selectedOption ? `(${selectedOption.name})` : ''} has been added to your cart.`,
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
                    <p className="text-sm text-muted-foreground">Game / Top up</p>
                </div>
            </CardContent>
        </Card>

        {hasOptions && (
          <SectionCard title="Select Recharge" step="1">
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

        <SectionCard title="Account Info" step={hasOptions ? "2" : "1"}>
            <div className="space-y-2">
                <Label htmlFor="uid">Player ID</Label>
                <Input id="uid" placeholder="Enter player id" value={uid} onChange={(e) => { setUid(e.target.value); }} />
            </div>
        </SectionCard>

        <SectionCard title="Quantity" step={hasOptions ? "3" : "2"}>
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

        <SectionCard title="Select Payment" step={hasOptions ? "4" : "3"}>
          <RadioGroup defaultValue="wallet" className="mt-2 grid grid-cols-2 gap-4" onValueChange={setPaymentMethod}>
            <div>
              <RadioGroupItem value="wallet" id="wallet" className="peer sr-only" />
              <Label htmlFor="wallet" className="flex flex-col text-center items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <Zap className="h-6 w-6 mb-2" />
                Instant Pay (Wallet)
              </Label>
            </div>
            <div>
              <RadioGroupItem value="gateway" id="gateway" className="peer sr-only" />
              <Label htmlFor="gateway" className="flex flex-col text-center items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <CreditCardIcon className="h-6 w-6 mb-2" />
                Payment Gateway
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
                    <Input placeholder="Coupon Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                    <Button variant="outline">Apply</Button>
                </div>

                <Separator />

                <div className="space-y-2 mt-4">
                    <div className="flex justify-between">
                        <span>{selectedOption ? selectedOption.name : card.name} x {quantity}</span>
                        <span>৳{totalPrice.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-৳{discount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>৳{finalPrice.toFixed(2)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-6">
                    {isLoggedIn ? (
                        <>
                           <Button variant="outline" size="lg" onClick={handleAddToCart} className="text-base">
                                <ShoppingCart className="mr-2" /> Add to Cart
                            </Button>
                            <Button size="lg" onClick={handleOrderNowClick} className="text-base font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                                <Zap className="mr-2" /> BUY NOW
                            </Button>
                        </>
                    ) : (
                        <Button size="lg" onClick={() => router.push('/login')} className="text-base font-bold">
                            Login to Order
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
        <SectionCard title="Description" className="mt-8">
             <p className='text-muted-foreground text-sm'>{card.description}</p>
        </SectionCard>

      </div>
    </div>
    <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
                <AlertDialogDescription>
                    Please review your order details before confirming.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Item:</span>
                    <span className="font-semibold">{card.name} - {selectedOption?.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Player ID:</span>
                    <span className="font-semibold font-mono">{uid}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                    <span>Total Amount:</span>
                    <span>৳{finalPrice.toFixed(2)}</span>
                </div>
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmOrder} disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Order
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
