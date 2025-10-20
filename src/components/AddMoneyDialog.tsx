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
import { paymentMethods } from "@/lib/data";
import Image from "next/image";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddMoneyDialog({ open, onOpenChange }: AddMoneyDialogProps) {
    const [amount, setAmount] = useState('');
    const { toast } = useToast();

    const handleProceed = () => {
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'Please enter a valid amount to add.',
            });
            return;
        }
        // In a real app, this would redirect to a payment gateway.
        toast({
            title: 'Redirecting to Payment',
            description: `You are being redirected to complete your payment of ৳${amount}.`,
        });
        onOpenChange(false);
        setAmount('');
    };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Money to Wallet</DialogTitle>
          <DialogDescription>
            Choose a payment method and enter the amount you want to add.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
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
          <p className="text-sm text-muted-foreground text-center">Select a payment method</p>
          <div className="grid grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
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
            ))}
          </div>
        </div>
        <Button onClick={handleProceed} className="bg-primary hover:bg-accent">
            Proceed to Pay ৳{amount || '0.00'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
