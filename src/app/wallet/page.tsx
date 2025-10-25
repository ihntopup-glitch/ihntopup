'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowDownCircle, ArrowUpCircle, CheckCircle, Clock, Loader2, Search, XCircle, Wallet } from 'lucide-react';
import type { WalletTopUpRequest } from '@/lib/data';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFirestore } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useState, useMemo, useEffect } from 'react';
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
        <div className="flex justify-end items-center mt-3 pt-3 border-t">
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

  const [userTopUpRequests, setUserTopUpRequests] = useState<WalletTopUpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !firebaseUser?.uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const requestsQuery = query(
      collection(firestore, 'wallet_top_up_requests'),
      where('userId', '==', firebaseUser.uid),
      orderBy('requestDate', 'desc')
    );

    const unsubscribe = onSnapshot(requestsQuery, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletTopUpRequest));
      setUserTopUpRequests(requests);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching wallet requests: ", error);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firestore, firebaseUser?.uid]);


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

  if (!firebaseUser && !isLoading) {
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Card className="flex-1 w-full shadow-md">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Wallet className="h-10 w-10 text-primary" />
                        <div>
                            <CardTitle className="text-xl font-bold">My Wallet</CardTitle>
                            <p className="text-2xl font-bold text-primary">৳{appUser?.walletBalance?.toFixed(2) ?? '0.00'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Button onClick={() => setIsAddMoneyOpen(true)} className="w-full sm:w-auto">Add Money</Button>
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
