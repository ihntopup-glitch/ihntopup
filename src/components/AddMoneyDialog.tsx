'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "@/lib/data";
import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Loader2 } from "lucide-react";

interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddMoneyDialog({ open, onOpenChange }: AddMoneyDialogProps) {
    const [amount, setAmount] = useState('');
    const { toast } = useToast();
    const firestore = useFirestore();

    const paymentMethodsQuery = useMemoFirebase(
      () => firestore ? query(collection(firestore, 'payment_methods')) : null,
      [firestore]
    );
    const { data: paymentMethods, isLoading } = useCollection<PaymentMethod>(paymentMethodsQuery);

    const handleProceed = () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast({
                variant: 'destructive',
                title: 'অবৈধ পরিমাণ',
                description: 'অনুগ্রহ করে যোগ করার জন্য একটি বৈধ পরিমাণ লিখুন।',
            });
            return;
        }
        // In a real app, this would redirect to a payment gateway.
        toast({
            title: 'পেমেন্টের জন্য রিডাইরেক্ট করা হচ্ছে',
            description: `আপনাকে ৳${amount} পেমেন্ট সম্পন্ন করার জন্য রিডাইরেক্ট করা হচ্ছে।`,
        });
        onOpenChange(false);
        setAmount('');
    };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ওয়ালেটে টাকা যোগ করুন</DialogTitle>
          <DialogDescription>
            একটি পেমেন্ট পদ্ধতি বেছে নিন এবং যে পরিমাণ টাকা যোগ করতে চান তা লিখুন।
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              পরিমাণ
            </Label>
            <Input 
                id="amount" 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="৳0.00" 
                className="col-span-3" 
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">একটি পেমেন্ট পদ্ধতি নির্বাচন করুন</p>
          <div className="grid grid-cols-3 gap-4">
            {isLoading ? (
                <div className="col-span-3 flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                paymentMethods?.map((method) => (
                <Button key={method.id} variant="outline" className="h-auto p-2 flex flex-col gap-2">
                    <div className="relative w-20 h-10">
                        <Image
                            src={method.image.src}
                            alt={method.name}
                            fill
                            className="object-contain"
                            data-ai-hint={method.image.hint}
                        />
                    </div>
                    <span className="text-xs">{method.name}</span>
                </Button>
                ))
            )}
          </div>
        </div>
        <Button onClick={handleProceed} className="bg-primary hover:bg-accent">
            ৳{amount || '0.00'} পরিশোধ করতে এগিয়ে যান
        </Button>
      </DialogContent>
    </Dialog>
  );
}
