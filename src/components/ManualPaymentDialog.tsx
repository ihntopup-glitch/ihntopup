'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { PaymentMethod } from "@/lib/data";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ManualPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isProcessing: boolean;
  onSubmit: (details: { senderPhone: string, transactionId: string, method: string }) => void;
  totalAmount: number;
}

type FormValues = {
  senderPhone: string;
  transactionId: string;
  method: string; // This will be the ID of the payment method document
}

export default function ManualPaymentDialog({ open, onOpenChange, isProcessing, onSubmit, totalAmount }: ManualPaymentDialogProps) {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const paymentMethodsQuery = useMemoFirebase(
      () => firestore ? query(collection(firestore, 'payment_methods')) : null,
      [firestore]
    );
    const { data: paymentMethods, isLoading } = useCollection<PaymentMethod>(paymentMethodsQuery);
    
    const selectedMethodId = watch('method');
    const selectedMethod = useMemo(() => {
        return paymentMethods?.find(p => p.id === selectedMethodId);
    }, [selectedMethodId, paymentMethods]);

    const handleFormSubmit = (data: FormValues) => {
        const methodName = paymentMethods?.find(p => p.id === data.method)?.name || 'N/A';
        onSubmit({ ...data, method: methodName });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'নম্বর কপি করা হয়েছে!' });
    };
    
    const getMethodBgColor = (methodName?: string) => {
        if (!methodName) return 'bg-yellow-100/50 border-yellow-300';
        const lowerCaseName = methodName.toLowerCase();
        if (lowerCaseName.includes('bkash')) {
            return 'bg-pink-100/50 border-pink-300';
        }
        if (lowerCaseName.includes('nagad')) {
            return 'bg-red-100/50 border-red-300';
        }
        return 'bg-gray-100/50 border-gray-300';
    }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ম্যানুয়াল পেমেন্ট</DialogTitle>
          <DialogDescription>
            অনুগ্রহ করে আপনার পেমেন্টের তথ্য জমা দিন। অ্যাডমিন পর্যালোচনার পর আপনার অর্ডারটি সম্পন্ন হবে।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            
             <div className="space-y-2">
                <Label htmlFor="method">পেমেন্ট পদ্ধতি</Label>
                <Controller
                    name="method"
                    control={control}
                    rules={{ required: "পেমেন্ট পদ্ধতি নির্বাচন করুন" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger disabled={isLoading}>
                                <SelectValue placeholder={isLoading ? "লোড হচ্ছে..." : "একটি পদ্ধতি নির্বাচন করুন"} />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods?.map(method => (
                                    <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                 {errors.method && <p className="text-red-500 text-xs">{errors.method.message}</p>}
            </div>

            {selectedMethod && (
                <div className={cn("p-4 rounded-lg border text-sm text-center", getMethodBgColor(selectedMethod.name))}>
                    <p>অনুগ্রহ করে নিচের নম্বরে <strong className="text-primary">৳{totalAmount.toFixed(2)}</strong> পাঠান</p>
                    <div className="flex items-center justify-center gap-2 my-2">
                        <span className="font-bold text-lg text-primary">{selectedMethod.accountNumber}</span>
                        <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(selectedMethod.accountNumber)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">({selectedMethod.accountType} Account)</p>
                    {selectedMethod.instructions && (
                        <div className="text-left text-xs space-y-1">
                            {selectedMethod.instructions.split('. ').map((line, index) => (
                                line && <p key={index}>• {line}</p>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            <div className="space-y-2">
                <Label htmlFor="senderPhone">প্রেরকের ফোন নম্বর</Label>
                <Input id="senderPhone" {...register("senderPhone", { required: "প্রেরকের নম্বর আবশ্যক" })} placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন" />
                {errors.senderPhone && <p className="text-red-500 text-xs">{errors.senderPhone.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="transactionId">ট্রানজেকশন আইডি</Label>
                <Input id="transactionId" {...register("transactionId")} placeholder="পেমেন্টের ট্রানজেকশন আইডি (ঐচ্ছিক)" />
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>বাতিল</Button>
                <Button type="submit" disabled={isProcessing}>
                    {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    অর্ডার জমা দিন
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}