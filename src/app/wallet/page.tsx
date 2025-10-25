'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Loader2, ArrowRight, Clock, CheckCircle, XCircle, Ban, RefreshCw, AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import AddMoneyDialog from '@/components/AddMoneyDialog';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import type { WalletTopUpRequest } from '@/lib/data';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import TransactionDetailDialog from '@/components/TransactionDetailDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    currencyDisplay: 'symbol',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('BDT', '৳');
};

const getStatusInfo = (status: WalletTopUpRequest['status']) => {
  switch (status) {
    case 'Approved':
      return {
        className: 'text-green-600',
        icon: CheckCircle,
        badgeClass: 'bg-green-100 text-green-800'
      };
    case 'Pending':
      return {
        className: 'text-yellow-600',
        icon: Clock,
        badgeClass: 'bg-yellow-100 text-yellow-800'
      };
    case 'Rejected':
      return {
        className: 'text-red-600',
        icon: XCircle,
        badgeClass: 'bg-red-100 text-red-800'
      };
    default:
      return {
        className: 'text-gray-500',
        icon: Clock,
        badgeClass: 'bg-gray-100'
      };
  }
};


export default function WalletPage() {
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WalletTopUpRequest | null>(null);
  const { appUser, firebaseUser, loading: authLoading } = useAuthContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All');

  const requestsQuery = useMemoFirebase(() => {
    if (!firebaseUser?.uid || !firestore) return null;
    return query(
        collection(firestore, 'wallet_top_up_requests'), 
        where('userId', '==', firebaseUser.uid), 
        orderBy('requestDate', 'desc')
    );
  }, [firebaseUser?.uid, firestore]);

  const { data: requests, isLoading: isLoadingRequests } = useCollection<WalletTopUpRequest>(requestsQuery);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (activeTab === 'All') return requests;
    if (activeTab === 'Completed') return requests.filter(r => r.status === 'Approved');
    if (activeTab === 'Cancelled') return requests.filter(r => r.status === 'Rejected');
    return requests.filter(r => r.status === activeTab);
  }, [requests, activeTab]);
  
  const isLoading = authLoading || isLoadingRequests;

  const handleCancelRequest = (requestId: string) => {
    if(!firestore) return;
    const requestDocRef = doc(firestore, 'wallet_top_up_requests', requestId);
    updateDocumentNonBlocking(requestDocRef, { status: 'Rejected' });
    toast({
        title: "অনুরোধ বাতিল করা হয়েছে",
        description: "আপনার টপ-আপ অনুরোধটি বাতিল করা হয়েছে।",
    });
  }

  if (isLoading && !appUser) {
    return (
        <div className="container mx-auto px-4 py-6 text-center flex items-center justify-center min-h-[calc(100vh-8rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  const TransactionItem = ({ request }: { request: WalletTopUpRequest }) => {
    const statusInfo = getStatusInfo(request.status);
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className='flex-shrink-0'>
              <statusInfo.icon className={cn("h-6 w-6", statusInfo.className)} />
            </div>

            <div className="flex-grow space-y-1 text-sm">
                <Badge variant={'outline'} className={cn(statusInfo.badgeClass, "font-bold")}>{request.status}</Badge>
                <p className="text-muted-foreground">Phone: <span className='font-mono'>{request.senderPhone}</span></p>
                <p className="text-muted-foreground">Trx id: <span className='font-mono'>{request.transactionId || 'N/A'}</span></p>
                <p className="text-xs text-muted-foreground">{new Date(request.requestDate).toLocaleString()}</p>
            </div>
            
            <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-primary">{formatCurrency(request.amount)}</p>
            </div>
          </div>
          {request.status === 'Pending' && (
            <div className="mt-4 pt-3 border-t flex justify-end gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Cancel</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently cancel your top-up request.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Back</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleCancelRequest(request.id)}>Confirm</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button size="sm" onClick={() => setSelectedRequest(request)}>Details</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };


  return (
    <>
      <div className="container mx-auto px-4 py-6 fade-in min-h-[calc(100vh-10rem)]">
        <div className="w-full max-w-2xl mx-auto space-y-6">
            
            <Card className="bg-white shadow-md">
                <CardHeader className="text-left pb-4">
                    <div className='flex justify-between items-center'>
                      <div>
                        <CardDescription className="text-muted-foreground">Balance</CardDescription>
                        <CardTitle className="text-4xl font-bold">{formatCurrency(appUser?.walletBalance ?? 0)}</CardTitle>
                      </div>
                      <Button variant={'ghost'} size={'icon'}>
                        <RefreshCw className='h-5 w-5 text-muted-foreground' />
                      </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button variant="default" className="w-full text-lg h-12" onClick={() => setIsAddMoneyOpen(true)}>
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Add Money
                    </Button>
                </CardContent>
            </Card>

            <div>
                <h2 className="text-xl font-bold mb-4">Transactions</h2>
                 <Tabs defaultValue="All" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="All">All</TabsTrigger>
                        <TabsTrigger value="Completed">Completed</TabsTrigger>
                        <TabsTrigger value="Pending">Pending</TabsTrigger>
                        <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-4 space-y-3">
                         {isLoadingRequests ? (
                             <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                         ) : filteredRequests.length > 0 ? (
                            filteredRequests.map(req => <TransactionItem key={req.id} request={req} />)
                         ) : (
                            <p className="text-center text-muted-foreground py-8">No transactions in this category.</p>
                         )}
                    </div>
                </Tabs>
            </div>
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
