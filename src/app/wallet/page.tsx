'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { walletData, type WalletTransaction } from '@/lib/data';
import { cn } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import AddMoneyDialog from '@/components/AddMoneyDialog';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function WalletPage() {
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto px-4 py-6 fade-in">
        <h1 className="text-3xl font-bold font-headline mb-6">My Wallet</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 bg-primary text-primary-foreground">
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

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>A record of your recent wallet activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletData.transactions.map((tx: WalletTransaction) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                      <TableCell className="font-medium">{tx.description}</TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-semibold',
                          tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        {tx.type === 'credit' ? '+' : ''}
                        {formatCurrency(tx.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      <AddMoneyDialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen} />
    </>
  );
}
