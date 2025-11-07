

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { AlertCircle, Gamepad2, Info, Loader2, RefreshCw, Wallet } from "lucide-react";
import Image from "next/image";
import { useState } from 'react';
import type { CartItem, Order, TopUpCardData, TopUpCardOption, Coupon } from "@/lib/data";
import { useAuthContext } from "@/contexts/AuthContext";
import { useFirestore } from "@/firebase";
import { doc, runTransaction, collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ProcessingLoader } from "./ui/processing-loader";
import { RedirectLoader } from './ui/redirect-loader';
import { useCart } from "@/contexts/CartContext";
import { sendOrderAlert } from "@/lib/telegram";
import { useRouter } from "next/navigation";

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  totalAmount: number;
  coupon: Coupon | null;
  onCheckoutSuccess: () => void;
}

export default function CheckoutDialog({ open, onOpenChange, cartItems, totalAmount, coupon, onCheckoutSuccess }: CheckoutDialogProps) {
  const { appUser, firebaseUser } = useAuthContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { removeItems } = useCart();
  const router = useRouter();

  const [uid, setUid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'instant'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const walletBalance = appUser?.walletBalance ?? 0;
  const hasSufficientBalance = walletBalance >= totalAmount;

  const handleOrderPlacement = async () => {
    if (!uid) {
      toast({ variant: 'destructive', title: 'UID is required', description: 'Please enter your game ID.' });
      return;
    }

    if (paymentMethod === 'instant') {
        setIsRedirecting(true);

      const paymentInfo = {
        type: 'productPurchase',
        cartItems: cartItems.map(item => ({
            cardId: item.card.id,
            name: item.card.name,
            image: item.card.image.src,
            quantity: item.quantity,
            selectedOptionName: item.selectedOption?.name,
            price: item.selectedOption?.price
        })),
        amount: totalAmount,
        couponId: coupon?.id || null,
        uid: uid
      };
      
      const sessionId = crypto.randomUUID();
      sessionStorage.setItem('paymentSessionId', sessionId);


      const params = new URLSearchParams({
        type: 'productPurchase',
        amount: totalAmount.toString(),
        uid: uid,
        cartItems: encodeURIComponent(JSON.stringify(paymentInfo.cartItems)),
        sessionId: sessionId,
      });

      if (coupon?.id) {
        params.set('couponId', coupon.id);
      }
      
      setTimeout(() => {
        router.push(`/payment?${params.toString()}`);
        setIsRedirecting(false);
        onOpenChange(false);
      }, 1500);


    } else if (paymentMethod === 'wallet') {
      await handleWalletPayment();
    }
  };

  const createOrderFromCartItem = (item: CartItem, payment: string): Omit<Order, 'id'> => {
    return {
        userId: firebaseUser!.uid,
        userName: appUser?.name || firebaseUser?.displayName || 'Unknown User',
        topUpCardId: item.card.id,
        productName: item.card.name,
        productOption: item.selectedOption?.name || 'Standard',
        quantity: item.quantity,
        gameUid: uid,
        paymentMethod: payment,
        couponId: coupon?.id || null,
        totalAmount: (item.selectedOption?.price ?? item.card.price) * item.quantity, // Note: This is pre-discount
        orderDate: new Date().toISOString(),
        status: 'Pending',
    };
  };

  const handleWalletPayment = async () => {
    if (!hasSufficientBalance) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Balance',
        description: 'You do not have enough money in your wallet. Please add funds.',
      });
      return;
    }
    
    setIsProcessing(true);
    try {
        await runTransaction(firestore, async (transaction) => {
            const userRef = doc(firestore, 'users', firebaseUser!.uid);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) throw new Error("User not found");
            
            const currentBalance = userDoc.data().walletBalance || 0;
            if (currentBalance < totalAmount) {
                throw new Error("Insufficient wallet balance.");
            }

            // Create all orders
            for (const item of cartItems) {
                const newOrderRef = doc(collection(firestore, 'orders'));
                 let orderData = createOrderFromCartItem(item, 'Wallet');

                 const totalPreDiscount = cartItems.reduce((acc, i) => acc + (i.selectedOption?.price ?? i.card.price) * i.quantity, 0);
                const itemPrice = (item.selectedOption?.price ?? item.card.price) * item.quantity;
                const discountRatio = totalPreDiscount > 0 ? itemPrice / totalPreDiscount : 0;
                const totalDiscount = coupon ? (coupon.type === 'Percentage' ? totalPreDiscount * (coupon.value / 100) : coupon.value) : 0;
                const itemDiscount = totalDiscount * discountRatio;
                orderData.totalAmount = Math.max(0, itemPrice - itemDiscount);

                if (item.selectedOption?.stockLimit) {
                    const cardRef = doc(firestore, 'top_up_cards', item.card.id);
                    const cardDoc = await transaction.get(cardRef); // Use transaction.get
                    if (!cardDoc.exists()) throw new Error(`Product ${item.card.name} not found.`);
                    const cardData = cardDoc.data() as TopUpCardData;
                    const options = cardData.options || [];
                    const optionIndex = options.findIndex(o => o.name === item.selectedOption!.name);
                    if (optionIndex !== -1) {
                         const newSoldCount = (options[optionIndex].stockSoldCount || 0) + item.quantity;
                         options[optionIndex].stockSoldCount = newSoldCount;
                         transaction.update(cardRef, { options }); // Use transaction.update
                    }
                }

                const finalOrderData = { ...orderData, id: newOrderRef.id };
                transaction.set(newOrderRef, finalOrderData);
                sendOrderAlert(finalOrderData); // Send alert for each order
            }
            
            // Deduct total balance at the end
            transaction.update(userRef, { walletBalance: currentBalance - totalAmount });
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
        removeItems(cartItems);
        toast({ title: 'Order Successful!', description: 'Your orders have been placed and are pending review.' });
        onCheckoutSuccess();
        onOpenChange(false);

    } catch (error: any) {
        console.error("Wallet checkout failed:", error);
        toast({ variant: 'destructive', title: 'Order Failed', description: error.message || "An error occurred." });
    } finally {
        setIsProcessing(false);
    }
  };


  return (
    <>
      <ProcessingLoader isLoading={isProcessing} message="Processing your order..." />
      <RedirectLoader isLoading={isRedirecting} />
      <Dialog open={open} onOpenChange={(isOpen) => !isProcessing && onOpenChange(isOpen)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Checkout</DialogTitle>
            <DialogDescription className="text-center">Complete your order.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="uid" className="flex items-center gap-2"><Gamepad2 className="h-4 w-4"/> Player ID</Label>
                <Input id="uid" placeholder="Enter Player ID for all items" value={uid} onChange={(e) => setUid(e.target.value)} />
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Select Payment</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div onClick={() => setPaymentMethod('wallet')} className={cn('border-2 rounded-lg cursor-pointer transition-all overflow-hidden flex flex-col', paymentMethod === 'wallet' ? 'border-primary' : 'border-input bg-background hover:bg-muted')}>
                            <div className="relative w-full flex-grow p-4 flex items-center justify-center min-h-[80px]">
                                <Image src="https://i.imgur.com/bJH9BH5.png" alt="My Wallet" layout="fill" className="object-contain p-4"/>
                            </div>
                            <div className={cn("p-2 text-center w-full text-sm font-semibold", paymentMethod === 'wallet' ? 'bg-primary text-white' : 'bg-muted')}>
                                My Wallet
                            </div>
                        </div>
                        <div onClick={() => setPaymentMethod('instant')} className={cn('border-2 rounded-lg cursor-pointer transition-all overflow-hidden flex flex-col', paymentMethod === 'instant' ? 'border-primary' : 'border-input bg-background hover:bg-muted')}>
                            <div className="relative w-full flex-grow p-4 flex items-center justify-center min-h-[80px]">
                                <Image src="https://i.imgur.com/kUmq3Xe.png" alt="Instant Pay" layout="fill" className="object-contain"/>
                            </div>
                            <div className={cn("p-2 text-center w-full text-sm font-semibold", paymentMethod === 'instant' ? 'bg-primary text-white' : 'bg-muted')}>
                                Instant Pay
                            </div>
                        </div>
                    </div>
                     <div className='mt-4 space-y-2'>
                        <div className='flex items-center gap-2 text-sm p-2 rounded-md bg-blue-50 border border-blue-200'>
                            <Info className='h-5 w-5 text-blue-500' />
                            <p>Your wallet balance: <span className='font-bold'>৳{walletBalance.toFixed(2)}</span></p>
                        </div>
                        <div className='flex items-center gap-2 text-sm p-2 rounded-md bg-green-50 border border-green-200'>
                            <Info className='h-5 w-5 text-green-500' />
                            <p>You need to pay: <span className='font-bold'>৳{totalAmount.toFixed(2)}</span></p>
                        </div>
                    </div>
                    {paymentMethod === 'wallet' && !hasSufficientBalance && (
                        <div className="mt-3 text-xs text-destructive flex items-center gap-1.5 p-2 bg-destructive/10 rounded-md">
                            <AlertCircle className="h-4 w-4" />
                            <span>You do not have sufficient balance in your wallet.</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Separator />
            <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{totalAmount.toFixed(2)}</span>
            </div>

            <Button size="lg" className="w-full font-bold" onClick={handleOrderPlacement} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {paymentMethod === 'wallet' ? 'Confirm Order' : 'Proceed to Pay'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
