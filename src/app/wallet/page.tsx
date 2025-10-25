'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import AddMoneyDialog from '@/components/AddMoneyDialog';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { WalletTopUpRequest } from '@/lib/data';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import TransactionDetailDialog from '@/components/TransactionDetailDialog';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('BDT', '৳');
};

const getStatusStyles = (status: WalletTopUpRequest['status']) => {
  switch (status) {
    case 'Approved':
      return {
        className: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
      };
    case 'Pending':
      return {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock,
      };
    case 'Rejected':
      return {
        className: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle,
      };
    default:
      return {
        className: 'bg-muted text-muted-foreground',
        icon: Clock,
      };
  }
};


export default function WalletPage() {
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WalletTopUpRequest | null>(null);
  const { appUser, firebaseUser, loading: authLoading } = useAuthContext();
  const firestore = useFirestore();

  const requestsQuery = useMemoFirebase(() => {
    if (!firebaseUser?.uid || !firestore) return null;
    return query(
        collection(firestore, 'wallet_top_up_requests'), 
        where('userId', '==', firebaseUser.uid), 
        orderBy('requestDate', 'desc')
    );
  }, [firebaseUser?.uid, firestore]);

  const { data: requests, isLoading: isLoadingRequests } = useCollection<WalletTopUpRequest>(requestsQuery);
  
  const isLoading = authLoading || isLoadingRequests;

  if (isLoading && !appUser) {
    return (
        <div className="container mx-auto px-4 py-6 text-center flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 fade-in min-h-[calc(100vh-10rem)]">
        <div className="w-full max-w-2xl mx-auto space-y-8">
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

            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Your recent wallet top-up requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoadingRequests ? (
                         <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : requests && requests.length > 0 ? (
                        requests.map(req => {
                            const statusStyle = getStatusStyles(req.status);
                            return (
                                <Card key={req.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedRequest(req)}>
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-grow">
                                                <p className="font-bold text-lg">
                                                    {formatCurrency(req.amount)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{new Date(req.requestDate).toLocaleString()}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant="secondary" className={cn("text-xs border rounded-full", statusStyle.className)}>{req.status}</Badge>
                                                <div className="flex items-center text-xs text-primary font-semibold">
                                                    Details <ArrowRight className="h-3 w-3 ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No transaction history found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      <AddMoneyDialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen} />
      {selectedRequest && (
        <TransactionDetailDialog
            open={!!selectedRequest}
            onOpenChange={(isOpen) => !isOpen && setSelectedRequest(null)}
            transaction={selectedRequest}
        />
      )}
    </>
  );
}
