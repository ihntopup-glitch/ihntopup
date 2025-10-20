'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { WalletTransaction } from "@/lib/data";
import { cn } from "@/lib/utils";

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: WalletTransaction;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('BDT', '৳');
};

export default function TransactionDetailDialog({ open, onOpenChange, transaction }: TransactionDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Details for transaction ID: {transaction.id}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-3 items-center">
                <span className="text-muted-foreground">Description:</span>
                <span className="col-span-2 font-medium">{transaction.description}</span>
            </div>
            <div className="grid grid-cols-3 items-center">
                <span className="text-muted-foreground">Date:</span>
                <span className="col-span-2 font-medium">{transaction.date}</span>
            </div>
             <div className="grid grid-cols-3 items-center">
                <span className="text-muted-foreground">Type:</span>
                <span className="col-span-2 font-medium capitalize">{transaction.type}</span>
            </div>
             <div className="grid grid-cols-3 items-center">
                <span className="text-muted-foreground">Amount:</span>
                <span className={cn(
                    "col-span-2 font-bold text-lg",
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                )}>
                    {transaction.type === 'credit' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                </span>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
