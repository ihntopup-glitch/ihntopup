'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WalletTopUpRequest } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const getStatusBadgeVariant = (status: WalletTopUpRequest['status']) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: WalletTopUpRequest['status']) => {
    switch (status) {
        case 'Approved': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        case 'Pending': return <Clock className="h-4 w-4 text-yellow-600" />;
        case 'Rejected': return <XCircle className="h-4 w-4 text-red-600" />;
        default: return <Clock className="h-4 w-4" />;
    }
}

export default function WalletRequestsPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState<WalletTopUpRequest | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const { toast } = useToast();
    const firestore = useFirestore();

    const requestsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'wallet_top_up_requests'), orderBy('requestDate', 'desc')) : null, [firestore]);
    const { data: requests, isLoading } = useCollection<WalletTopUpRequest>(requestsQuery);
    
    const filteredRequests = (status: WalletTopUpRequest['status']) => {
        return requests?.filter(r => r.status === status) || [];
    }

    const handleProcessRequest = (request: WalletTopUpRequest) => {
        setSelectedRequest(request);
        setIsDialogOpen(true);
    }

    const handleStatusUpdate = async (action: 'approve' | 'reject') => {
        if (!selectedRequest || !firestore) return;

        setIsSubmitting(true);
        const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        const docRef = doc(firestore, 'wallet_top_up_requests', selectedRequest.id);

        try {
            await updateDoc(docRef, { status: newStatus });
            toast({
                title: 'স্ট্যাটাস আপডেট হয়েছে',
                description: `অনুরোধটি সফলভাবে ${newStatus} করা হয়েছে।`,
            });
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: "অপারেশন ব্যর্থ হয়েছে",
                description: error.message || "স্ট্যাটাস আপডেট করার সময় একটি ত্রুটি ঘটেছে।"
            });
        } finally {
            setIsSubmitting(false);
            setIsDialogOpen(false);
        }
    }
    
    const renderTable = (data: WalletTopUpRequest[]) => (
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>ব্যবহারকারী</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead className="hidden md:table-cell">প্রেরকের নম্বর</TableHead>
                <TableHead className="hidden sm:table-cell">পেমেন্ট মেথড</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">একশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((request) => (
                <TableRow key={request.id}>
                    <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                        <div className="font-medium">{request.userEmail}</div>
                        <div className="text-xs text-muted-foreground font-mono">{request.userId}</div>
                    </TableCell>
                    <TableCell className="font-semibold">৳{request.amount}</TableCell>
                    <TableCell className="hidden md:table-cell font-mono">{request.senderPhone}</TableCell>
                    <TableCell className="hidden sm:table-cell">{request.method}</TableCell>
                    <TableCell>
                        <Badge className={getStatusBadgeVariant(request.status)} variant="outline">
                           <span className='mr-1'>{getStatusIcon(request.status)}</span> {request.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button 
                            variant={'outline'}
                            size="sm"
                            onClick={() => handleProcessRequest(request)}
                        >
                           বিস্তারিত
                        </Button>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
    )

  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">ওয়ালেট টপ-আপ অনুরোধ</h1>
      </div>

       <Tabs defaultValue="pending">
        <TabsList>
            <TabsTrigger value="pending">পেন্ডিং</TabsTrigger>
            <TabsTrigger value="approved">অনুমোদিত</TabsTrigger>
            <TabsTrigger value="rejected">বাতিল</TabsTrigger>
        </TabsList>
        <Card className='mt-4'>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="ব্যবহারকারীর ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন..." className="pl-8 w-full" />
              </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : (
                    <>
                        <TabsContent value="pending">{renderTable(filteredRequests('Pending'))}</TabsContent>
                        <TabsContent value="approved">{renderTable(filteredRequests('Approved'))}</TabsContent>
                        <TabsContent value="rejected">{renderTable(filteredRequests('Rejected'))}</TabsContent>
                    </>
                )}
            </CardContent>
          </Card>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>অনুরোধ প্রসেস করুন</DialogTitle>
              <DialogDescription>
                অনুরোধটি অনুমোদন অথবা বাতিল করুন।
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
                <div className="grid gap-4 py-4">
                   <div className='space-y-1'>
                     <p className='text-sm text-muted-foreground'>ব্যবহারকারী: {selectedRequest.userEmail}</p>
                     <p className='text-sm text-muted-foreground'>অনুরোধ করা পরিমাণ: <span className='font-bold'>৳{selectedRequest.amount}</span></p>
                     <p className='text-sm text-muted-foreground'>প্রেরকের নম্বর: <span className='font-mono'>{selectedRequest.senderPhone}</span></p>
                     <p className='text-sm text-muted-foreground'>পেমেন্ট মেথড: {selectedRequest.method}</p>
                     {selectedRequest.transactionId && <p className='text-sm text-muted-foreground'>লেনদেন আইডি: <span className='font-mono'>{selectedRequest.transactionId}</span></p>}
                   </div>
                </div>
            )}
            <DialogFooter className='grid grid-cols-2 gap-2'>
              <Button variant="destructive" onClick={() => handleStatusUpdate('reject')} disabled={isSubmitting || selectedRequest?.status !== 'Pending'}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <XCircle className="mr-2 h-4 w-4" />}
                বাতিল করুন
              </Button>
              <Button onClick={() => handleStatusUpdate('approve')} disabled={isSubmitting || selectedRequest?.status !== 'Pending'}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                অনুমোদন করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}
