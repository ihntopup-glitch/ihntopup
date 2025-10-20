'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { walletData, type WalletTransaction } from '@/lib/data';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import AddMoneyDialog from '@/components/AddMoneyDialog';
import TransactionDetailDialog from '@/components/TransactionDetailDialog';
import { Badge } from '@/components/ui/badge';


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('BDT', '৳');
};

export default function WalletPage() {
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);

  const getStatusVariant = (type: WalletTransaction['type']) => {
    switch (type) {
      case 'credit':
        return 'default';
      case 'debit':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6 fade-in">
        <h1 className="text-3xl font-bold font-headline mb-6">My Wallet</h1>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-1 bg-primary text-primary-foreground shadow-lg">
            <CardHeader>
              <CardDescription className="text-primary-foreground/80">Current Balance</CardDescription>
              <CardTitle className="text-4xl">{formatCurrency(walletData.balance)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" onClick={() => setIsAddMoneyOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Money
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 rounded-2xl shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>A record of your recent wallet activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {walletData.transactions.map((tx: WalletTransaction) => (
                 <Card 
                    key={tx.id} 
                    className="p-3 shadow-sm bg-background/50 rounded-xl cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => setSelectedTransaction(tx)}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex-grow">
                            <p className="font-bold text-sm">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                        <div className='text-right'>
                            <p
                                className={cn(
                                'font-semibold',
                                tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                )}
                            >
                                {tx.type === 'credit' ? '+' : '-'}
                                {formatCurrency(Math.abs(tx.amount))}
                            </p>
                            <Badge variant={getStatusVariant(tx.type)} className="mt-1 text-xs">
                                {tx.type}
                            </Badge>
                        </div>
                    </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <AddMoneyDialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen} />
      {selectedTransaction && (
          <TransactionDetailDialog 
            transaction={selectedTransaction}
            open={!!selectedTransaction}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setSelectedTransaction(null);
                }
            }}
          />
      )}
    </>
  );
}
