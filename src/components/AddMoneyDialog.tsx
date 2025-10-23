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
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useForm, Controller } from "react-hook-form";

interface AddMoneyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = {
  amount: number;
  senderPhone: string;
  transactionId: string;
  method: string;
}

export default function AddMoneyDialog({ open, onOpenChange }: AddMoneyDialogProps) {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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
        setIsSubmitting(true);
        console.log("Submitting manual payment for wallet top-up:", data);
        // Here you would typically save this request to Firestore for admin review
        toast({
            title: 'অনুরোধ জমা হয়েছে',
            description: 'আপনার ওয়ালেট টপ-আপ অনুরোধ পর্যালোচনার জন্য জমা দেওয়া হয়েছে।',
        });
        setTimeout(() => {
            setIsSubmitting(false);
            onOpenChange(false);
        }, 1000);
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ওয়ালেটে টাকা যোগ করুন</DialogTitle>
          <DialogDescription>
            ম্যানুয়ালি পেমেন্ট করে আপনার ওয়ালেট রিচার্জ করুন।
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">পরিমাণ (৳)</Label>
                <Input id="amount" type="number" {...register("amount", { required: "পরিমাণ আবশ্যক", valueAsNumber: true, min: 1 })} placeholder="কত টাকা যোগ করতে চান?" />
                {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
            </div>

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
                 <div className="p-3 bg-yellow-100/50 rounded-lg border border-yellow-300 text-center text-sm">
                    <p>অনুগ্রহ করে নিচের নম্বরে <strong>{watch('amount') || 0} ৳</strong> পাঠান</p>
                    <p className="font-bold text-lg text-primary my-1">{selectedMethod.accountNumber}</p>
                    <p className="text-xs text-muted-foreground">({selectedMethod.accountType} Account)</p>
                    {selectedMethod.instructions && <p className="mt-2 text-xs">{selectedMethod.instructions}</p>}
                </div>
            )}
            
            <div className="space-y-2">
                <Label htmlFor="senderPhone">প্রেরকের ফোন নম্বর</Label>
                <Input id="senderPhone" {...register("senderPhone", { required: "প্রেরকের নম্বর আবশ্যক" })} placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন" />
                {errors.senderPhone && <p className="text-red-500 text-xs">{errors.senderPhone.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="transactionId">ট্রানজেকশন আইডি</Label>
                <Input id="transactionId" {...register("transactionId")} placeholder="পেমেন্টের ট্রানজেকশন আইডি (ঐচ্ছিক)" />
            </div>

            <div className="flex justify-end gap-2 !mt-6">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>বাতিল</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    অনুরোধ জমা দিন
                </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    