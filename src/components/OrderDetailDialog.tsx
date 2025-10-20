'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Calendar, Tag, User, List, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "./ui/badge";

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
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

const getStatusInfo = (status: Order['status']) => {
    switch (status) {
        case 'Completed':
            return { icon: CheckCircle, className: 'text-green-600', badgeClass: 'bg-green-100 text-green-800' };
        case 'Pending':
            return { icon: Clock, className: 'text-yellow-600', badgeClass: 'bg-yellow-100 text-yellow-800' };
        case 'Cancelled':
            return { icon: XCircle, className: 'text-red-600', badgeClass: 'bg-red-100 text-red-800' };
        default:
            return { icon: Clock, className: 'text-muted-foreground', badgeClass: 'bg-muted' };
    }
};

export default function OrderDetailDialog({ open, onOpenChange, order }: OrderDetailDialogProps) {
    const statusInfo = getStatusInfo(order.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl bg-card border-4 border-green-500 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Order Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl my-4 border border-green-200">
            <p className={cn("text-4xl font-extrabold tracking-tight text-primary")}>
                {formatCurrency(order.total)}
            </p>
             <p className="text-sm font-medium capitalize text-muted-foreground">{order.items}</p>
        </div>
        
        <Separator />

        <div className="grid gap-3 py-4 text-sm">
            <DetailRow icon={Tag} label="Order ID" value={<span className="font-mono">{order.id}</span>} />
            <DetailRow icon={Calendar} label="Date" value={order.date} />
            <DetailRow icon={User} label="User" value={order.user} />
            <DetailRow icon={List} label="Items" value={order.items} />
            <DetailRow icon={DollarSign} label="Total Amount" value={formatCurrency(order.total)} />
            <DetailRow icon={statusInfo.icon} label="Status" value={
                <Badge className={cn('text-xs', statusInfo.badgeClass)}>{order.status}</Badge>
            } />
        </div>
      </DialogContent>
    </Dialog>
  );
}