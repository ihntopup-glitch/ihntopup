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
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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
  method: string;
}

const paymentMethods = ["bKash", "Nagad", "Rocket"];

export default function ManualPaymentDialog({ open, onOpenChange, isProcessing, onSubmit, totalAmount }: ManualPaymentDialogProps) {
    const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>();
    const { toast } = useToast();

    const handleFormSubmit = (data: FormValues) => {
        onSubmit(data);
    };

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
            <div className="text-center p-4 bg-yellow-100/50 rounded-lg border border-yellow-300">
                <p className="font-bold text-lg">মোট প্রদেয়: <span className="text-primary">৳{totalAmount.toFixed(2)}</span></p>
                <p className="text-xs text-muted-foreground">এই পরিমাণ নিচের যেকোনো একটি নম্বরে পাঠান।</p>
            </div>

             <div className="space-y-2">
                <Label htmlFor="method">পেমেন্ট পদ্ধতি</Label>
                <Controller
                    name="method"
                    control={control}
                    rules={{ required: "পেমেন্ট পদ্ধতি নির্বাচন করুন" }}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="একটি পদ্ধতি নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map(method => (
                                    <SelectItem key={method} value={method}>{method}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                 {errors.method && <p className="text-red-500 text-xs">{errors.method.message}</p>}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="senderPhone">প্রেরকের ফোন নম্বর</Label>
                <Input id="senderPhone" {...register("senderPhone", { required: "প্রেরকের নম্বর आवश्यक" })} placeholder="যে নম্বর থেকে টাকা পাঠিয়েছেন" />
                {errors.senderPhone && <p className="text-red-500 text-xs">{errors.senderPhone.message}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="transactionId">ট্রানজেকশন আইডি</Label>
                <Input id="transactionId" {...register("transactionId", { required: "ট্রানজেকশন আইডি आवश्यक" })} placeholder="পেমেন্টের ট্রানজেকশন আইডি" />
                {errors.transactionId && <p className="text-red-500 text-xs">{errors.transactionId.message}</p>}
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
