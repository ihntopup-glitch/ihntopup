'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { WalletTransaction } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ArrowLeftRight, Calendar, Info, Tag } from "lucide-react";

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

const DetailRow = ({ icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => {
    const Icon = icon;
    return (
        <div className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg border">
            <Icon className="h-5 w-5 text-green-500 mt-1" />
            <div className="flex-grow">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-semibold text-foreground">{value}</p>
            </div>
        </div>
    );
};


export default function TransactionDetailDialog({ open, onOpenChange, transaction }: TransactionDetailDialogProps) {
  const isCredit = transaction.type === 'credit';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-card border-4 border-green-500 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl my-4 border border-green-200">
            <p className={cn(
                "text-4xl font-extrabold tracking-tight",
                isCredit ? 'text-green-600' : 'text-red-600'
            )}>
                {isCredit ? '+' : '-'}
                {formatCurrency(Math.abs(transaction.amount))}
            </p>
             <p className="text-sm font-medium capitalize text-muted-foreground">{transaction.type} for {transaction.description}</p>
        </div>
        
        <Separator />

        <div className="grid gap-3 py-4 text-sm">
            <DetailRow icon={Info} label="Description" value={transaction.description} />
            <DetailRow icon={Calendar} label="Date" value={transaction.date} />
            <DetailRow icon={ArrowLeftRight} label="Type" value={<span className="capitalize">{transaction.type}</span>} />
            <DetailRow icon={Tag} label="Transaction ID" value={<span className="font-mono">{transaction.id}</span>} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
