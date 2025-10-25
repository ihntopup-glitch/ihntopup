'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowDownCircle, ArrowUpCircle, CheckCircle, Clock, Loader2, Search, XCircle } from 'lucide-react';
import type { WalletTopUpRequest } from '@/lib/data';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import TransactionDetailDialog from '@/components/TransactionDetailDialog';
import AddMoneyDialog from '@/components/AddMoneyDialog';

const getStatusInfo = (status: WalletTopUpRequest['status']) => {
  switch (status) {
    case 'Approved':
      return {
        variant: 'secondary',
        className: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
      };
    case 'Pending':
      return {
        variant: 'secondary',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock,
      };
    case 'Rejected':
      return {
        variant: 'secondary',
        className: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle,
      };
    default:
      return {
        variant: 'secondary',
        className: 'bg-muted text-muted-foreground',
        icon: Clock,
      };
  }
};

const RequestItem = ({ request, onViewDetails }: { request: WalletTopUpRequest, onViewDetails: (request: WalletTopUpRequest) => void }) => {
  const statusInfo = getStatusInfo(request.status);
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
            <div className="bg-muted p-3 rounded-lg">
                <statusInfo.icon className={cn("h-8 w-8", statusInfo.className.replace(/bg-([a-z]+)-100/, 'text-$1-500'))} />
            </div>
            <div className="flex-grow">
                <p className="font-bold">Wallet Top-up via {request.method}</p>
                <p className="text-sm text-muted-foreground">From: <span className='font-mono'>{request.senderPhone}</span></p>
                {request.transactionId && <p className="text-xs text-muted-foreground">ID: <span className='font-mono'>{request.transactionId}</span></p>}
                <p className="text-xs text-muted-foreground">{new Date(request.requestDate).toLocaleString()}</p>
            </div>
             <div className="flex flex-col items-end gap-2">
                <p className="font-bold text-lg text-primary">৳{request.amount.toFixed(2)}</p>
                <Badge variant="secondary" className={cn("text-xs border rounded-full", statusInfo.className)}>{request.status}</Badge>
            </div>
        </div>
        <div className="flex justify-end items-center mt-3 pt-3 border-t gap-2">
            {request.status === 'Pending' && (
              <>
                <Button size="sm" variant="destructive">Cancel</Button>
                <Button size="sm">Pay Now</Button>
              </>
            )}
             <Button size="sm" variant="outline" onClick={() => onViewDetails(request)}>View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
};


export default function WalletPage() {
  const { firebaseUser, appUser } = useAuthContext();
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<WalletTopUpRequest | null>(null);
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);

  // Fetch all requests without filtering by user or ordering.
  const allRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'wallet_top_up_requests'));
  }, [firestore]);

  const { data: allTopUpRequests, isLoading: loadingRequests } = useCollection<WalletTopUpRequest>(allRequestsQuery);

  // Filter and sort the data on the client-side.
  const userTopUpRequests = useMemo(() => {
    if (!allTopUpRequests || !firebaseUser) return [];
    return allTopUpRequests
      .filter(req => req.userId === firebaseUser.uid)
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [allTopUpRequests, firebaseUser]);


  const filteredRequests = useMemo(() => {
    if (!userTopUpRequests) return [];

    let filtered = userTopUpRequests;

    if (activeTab !== 'All') {
        filtered = filtered.filter(req => req.status === activeTab);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(req => 
            req.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            req.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.senderPhone.includes(searchTerm)
        );
    }
    
    return filtered;
  }, [userTopUpRequests, searchTerm, activeTab]);

  const isLoading = loadingRequests;

  if (!firebaseUser) {
    return <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <div className='text-center'>
            <p className='mb-4'>Please log in to view your wallet.</p>
            <Button asChild><a href="/login">Login</a></Button>
        </div>
    </div>;
  }

  return (
    <>
    <div className="container mx-auto px-4 py-6 fade-in">
        <div className='flex justify-between items-center mb-6'>
            <div>
                 <h1 className="text-3xl font-bold font-headline">My Wallet</h1>
                 <p className='text-muted-foreground'>Current Balance: <span className='font-bold text-primary'>৳{appUser?.walletBalance?.toFixed(2) ?? '0.00'}</span></p>
            </div>
            <Button onClick={() => setIsAddMoneyOpen(true)}>Add Money</Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Pending">Pending</TabsTrigger>
                <TabsTrigger value="Approved">Completed</TabsTrigger>
                <TabsTrigger value="Rejected">Cancelled</TabsTrigger>
            </TabsList>
             <div className="relative my-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by Sender Phone or Transaction ID..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <TabsContent value={activeTab}>
                 {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((req) => (
                                <RequestItem key={req.id} request={req} onViewDetails={setSelectedRequest} />
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No requests found.</p>
                        )}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    </div>

    {selectedRequest && (
        <TransactionDetailDialog
            transaction={selectedRequest}
            open={!!selectedRequest}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setSelectedRequest(null);
                }
            }}
        />
    )}

    <AddMoneyDialog open={isAddMoneyOpen} onOpenChange={setIsAddMoneyOpen} />

    </>
  );
}
