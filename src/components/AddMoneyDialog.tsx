

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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";


interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export default function AddMoneyDialog({ open, onOpenChange }: AddMoneyDialogProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [amount, setAmount] = useState<number | ''>('');


    const handleProceedToPayment = () => {
        if (!amount || amount < 10) {
            toast({
                variant: 'destructive',
                title: 'অবৈধ পরিমাণ',
                description: 'ন্যূনতম ১০ টাকা যোগ করতে হবে।'
            });
            return;
        }
        
        setIsSubmitting(true);
        
        const sessionId = crypto.randomUUID();
        sessionStorage.setItem('paymentSessionId', sessionId);

        const params = new URLSearchParams({
            type: 'walletTopUp',
            amount: amount.toString(),
            sessionId: sessionId,
        });
        
        // Simulate a small delay for UX before redirecting
        setTimeout(() => {
            router.push(`/payment?${params.toString()}`);
            setIsSubmitting(false);
            onOpenChange(false);
            setAmount('');
        }, 500);
    };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6">
        <DialogHeader className="pb-4">
          <DialogTitle>ওয়ালেটে টাকা যোগ করুন</DialogTitle>
          <DialogDescription>
            ম্যানুয়ালি পেমেন্ট করে আপনার ওয়ালেট রিচার্জ করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">পরিমাণ (৳)</Label>
                <Input 
                    id="amount" 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="কত টাকা যোগ করতে চান?" />
            </div>

            <div className="flex justify-end gap-2 !mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>বাতিল</Button>
                <Button onClick={handleProceedToPayment} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    পেমেন্ট পেজে যান
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
