
'use client';

import { h, render } from 'preact';
import { useState, useEffect, useMemo } from 'react';
import htm from 'htm';
import { useForm, Controller } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, addDoc, runTransaction, doc, getDoc } from "firebase/firestore";
import type { PaymentMethod, TopUpCardData, Order } from "@/lib/data";
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Copy, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendTelegramAlert } from '@/lib/telegram';
import { ProcessingLoader } from '@/components/ui/processing-loader';
import Image from 'next/image';
import { cn } from '@/lib/utils';


const html = htm.bind(h);

type PaymentFormValues = {
  senderPhone: string;
  transactionId?: string;
};

export default function PaymentPage() {
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormValues>();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { firebaseUser, appUser } = useAuthContext();
  const router = useRouter();

  const paymentMethodsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'payment_methods')) : null,
    [firestore]
  );
  const { data: paymentMethods, isLoading: isLoadingMethods } = useCollection<PaymentMethod>(paymentMethodsQuery);
  
  const sortedPaymentMethods = useMemo(() => {
    if (!paymentMethods) return [];
    return [...paymentMethods].sort((a, b) => {
        if (a.name.toLowerCase() === 'bkash') return -1;
        if (b.name.toLowerCase() === 'bkash') return 1;
        if (a.name.toLowerCase() === 'nagad') return -1;
        if (b.name.toLowerCase() === 'nagad') return 1;
        return a.name.localeCompare(b.name);
    });
}, [paymentMethods]);


  useEffect(() => {
    const storedInfo = localStorage.getItem('paymentInfo');
    if (storedInfo) {
      setPaymentInfo(JSON.parse(storedInfo));
    } else {
      // Redirect if no payment info is found
      router.push('/');
    }
  }, [router]);

  const handleCopy = (numberToCopy: string) => {
    navigator.clipboard.writeText(numberToCopy).then(() => {
      setCopied(true);
      toast({ title: 'নম্বর কপি করা হয়েছে' });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const createOrderObject = (item: any, manualDetails: any): Omit<Order, 'id'> => {
    const totalPreDiscount = paymentInfo.cartItems.reduce((acc: number, i: any) => acc + i.price * i.quantity, 0);
    const itemPrice = item.price * item.quantity;
    const discountRatio = totalPreDiscount > 0 ? itemPrice / totalPreDiscount : 0;
    const totalDiscount = paymentInfo.coupon ? (paymentInfo.coupon.type === 'Percentage' ? totalPreDiscount * (paymentInfo.coupon.value / 100) : paymentInfo.coupon.value) : 0;
    const itemDiscount = totalDiscount * discountRatio;
    const finalAmount = Math.max(0, itemPrice - itemDiscount);

    return {
        userId: firebaseUser!.uid,
        userName: appUser?.name || 'Unknown',
        topUpCardId: item.cardId,
        productName: item.name,
        productOption: item.selectedOptionName || 'Standard',
        quantity: item.quantity,
        gameUid: paymentInfo.uid,
        paymentMethod: 'Manual',
        couponId: paymentInfo.couponId || null,
        originalAmount: itemPrice,
        totalAmount: finalAmount,
        orderDate: new Date().toISOString(),
        status: 'Pending',
        manualPaymentDetails: {
            method: selectedMethod!.name,
            ...manualDetails
        }
    };
  };

  const onSubmit = async (data: PaymentFormValues) => {
    if (!paymentInfo || !selectedMethod || !firestore || !firebaseUser) {
      toast({ variant: 'destructive', title: 'একটি ত্রুটি ঘটেছে' });
      return;
    }

    setIsProcessing(true);

    try {
      if (paymentInfo.type === 'productPurchase') {
        
        await runTransaction(firestore, async (transaction) => {
          for (const item of paymentInfo.cartItems) {
            const orderData = createOrderObject(item, data);
            const newOrderRef = doc(collection(firestore, "orders"));
            
            const finalOrderData = { ...orderData, id: newOrderRef.id };
            transaction.set(newOrderRef, finalOrderData);
            
            sendTelegramAlert(finalOrderData);
          }
        });

        toast({ title: "অর্ডার সফল হয়েছে!", description: "আপনার অর্ডারটি পর্যালোচনার জন্য অপেক্ষারত আছে।" });

      } else if (paymentInfo.type === 'walletTopUp') {
        const requestData = {
          userId: firebaseUser.uid,
          userEmail: appUser?.email || 'N/A',
          amount: paymentInfo.amount,
          senderPhone: data.senderPhone,
          transactionId: data.transactionId || '',
          method: selectedMethod.name,
          requestDate: new Date().toISOString(),
          status: 'Pending'
        };
        await addDoc(collection(firestore, 'wallet_top_up_requests'), requestData);
        toast({ title: 'অনুরোধ জমা হয়েছে', description: 'আপনার ওয়ালেট টপ-আপ অনুরোধ পর্যালোচনার জন্য জমা দেওয়া হয়েছে।' });
      }

      localStorage.removeItem('paymentInfo');
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push(paymentInfo.type === 'productPurchase' ? '/orders' : '/wallet');

    } catch (error: any) {
      console.error("Payment submission error:", error);
      toast({ variant: "destructive", title: "জমা দিতে ব্যর্থ", description: error.message || "একটি ত্রুটি ঘটেছে।" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDynamicBackgroundColor = () => {
    if(selectedMethod?.name.toLowerCase().includes('bkash')) return 'bg-[#e2136e]';
    if(selectedMethod?.name.toLowerCase().includes('nagad')) return 'bg-[#D81A24]';
    return 'bg-primary';
  }

  return (
    <>
    <ProcessingLoader isLoading={isProcessing} message="আপনার অনুরোধ প্রক্রিয়া করা হচ্ছে..."/>
    <div className="container mx-auto max-w-md px-4 py-8 min-h-screen">
      
      {!selectedMethod ? (
        // Step 1: Select Payment Method
        <div className="flex flex-col items-center gap-5">
            <div className="text-center">
                <Image src="https://i.imgur.com/bJH9BH5.png" alt="IHN TOPUP Logo" width={80} height={80} className="mx-auto rounded-full border-4 border-white shadow-lg" />
                <h1 className="text-2xl font-bold mt-3">IHN TOPUP</h1>
            </div>
            <div className="w-full bg-primary-dark text-white text-center p-3 rounded-lg font-semibold shadow-md">
                মোবাইল ব্যাংকিং
            </div>
            <div className="w-full grid grid-cols-2 gap-4">
                {isLoadingMethods ? <Loader2 className='animate-spin' /> : sortedPaymentMethods.map(method => (
                     <div
                        key={method.id}
                        role="button"
                        onClick={() => setSelectedMethod(method)}
                        className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-xl bg-white cursor-pointer transition-all hover:border-primary hover:shadow-lg hover:-translate-y-1 h-24"
                    >
                        <Image src={method.image.src} alt={method.name} width={100} height={40} className="object-contain" />
                    </div>
                ))}
            </div>
        </div>
      ) : (
        // Step 2: Payment Details
        <div className="flex flex-col gap-4">
            <Button variant="ghost" onClick={() => setSelectedMethod(null)} className="self-start gap-2">
                <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>
            <div className="text-center">
                <Image src={selectedMethod.image.src} alt={selectedMethod.name} width={150} height={50} className="mx-auto object-contain" />
            </div>

            <div className="bg-white border rounded-lg p-4 flex items-center gap-4">
                 <Image src="https://i.imgur.com/bJH9BH5.png" alt="IHN TOPUP" width={40} height={40} className="rounded-full" />
                 <div>
                    <h2 className="font-bold">IHN TOPUP</h2>
                    <p className="text-sm text-muted-foreground">Pay With {selectedMethod.name}</p>
                 </div>
            </div>

            <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold">৳ {paymentInfo?.totalAmount || paymentInfo?.amount || 0}</p>
            </div>

            <div className={cn("text-white rounded-lg p-6", getDynamicBackgroundColor())}>
                <h2 className="text-lg font-bold text-center mb-4">পেমেন্টের তথ্য দিন</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1">
                        <Label className="text-white/90">প্রেরকের {selectedMethod.name} নম্বর</Label>
                        <Input {...register('senderPhone', { required: true })} className="bg-white text-black" />
                        {errors.senderPhone && <p className="text-white text-xs font-bold">Sender number is required.</p>}
                    </div>
                    <div className="space-y-1">
                        <Label className="text-white/90">ট্রানজেকশন আইডি (ঐচ্ছিক)</Label>
                        <Input {...register('transactionId')} className="bg-white text-black" />
                    </div>

                    <div className="pt-4 text-sm space-y-3">
                        {selectedMethod.instructions?.split('\n').map((line, i) => (
                           <p key={i} className="flex items-start gap-2"><span className="font-bold mt-0.5">•</span><span>{line}</span></p>
                        ))}
                         <p className="flex items-start gap-2">
                            <span className="font-bold mt-0.5">•</span>
                            <span>
                                গ্রাহক নম্বর হিসেবে এই নম্বরটি লিখুনঃ <strong className="font-bold">{selectedMethod.accountNumber}</strong>
                                <Button type="button" variant="ghost" size="sm" onClick={() => handleCopy(selectedMethod.accountNumber)} className="h-auto px-2 py-1 ml-2 bg-white/20 hover:bg-white/30 text-white">
                                    <Copy className="h-3 w-3 mr-1" />
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>
                            </span>
                        </p>
                         <p className="flex items-start gap-2"><span className="font-bold mt-0.5">•</span><span>টাকার পরিমাণঃ <strong>{paymentInfo?.totalAmount || paymentInfo?.amount || 0}</strong></span></p>
                    </div>

                    <div className="pt-6">
                        <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={isProcessing}>
                            {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            SUBMIT
                        </Button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
    </>
  );
}
