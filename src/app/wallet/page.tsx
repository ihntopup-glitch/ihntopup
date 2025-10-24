'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import AddMoneyDialog from '@/components/AddMoneyDialog';
import { useAuthContext } from '@/contexts/AuthContext';

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
  const { appUser, loading: authLoading } = useAuthContext();
  
  const isLoading = authLoading;

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-6 text-center flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 fade-in">
        <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-bold font-headline mb-6 text-center">My Wallet</h1>

            <Card className="bg-primary text-primary-foreground shadow-lg">
                <CardHeader className="text-center">
                <CardDescription className="text-primary-foreground/80">Current Balance</CardDescription>
                <CardTitle className="text-5xl font-bold">{formatCurrency(appUser?.walletBalance ?? 0)}</CardTitle>
                </CardHeader>
                <CardContent>
                <Button variant="secondary" className="w-full text-lg h-12" onClick={() => setIsAddMoneyOpen(true)}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Add Money
                </Button>
                </CardContent>
            </Card>
        </div>
      </div>
      <AddMoneyDialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen} />
    </>
  );
}
