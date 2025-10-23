'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Search,
  Check,
  X,
  Clock,
  Loader2,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { WalletTopUpRequest } from '@/lib/data';
import { collection, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { handleWalletRequest } from '@/ai/flows/handle-wallet-request';

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

export default function WalletRequestsPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState<WalletTopUpRequest | null>(null);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const { toast } = useToast();

    const firestore = useFirestore();
    const requestsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'wallet_top_up_requests'), orderBy('requestDate', 'desc')) : null, [firestore]);
    const { data: requests, isLoading } = useCollection<WalletTopUpRequest>(requestsQuery);

    const handleViewDetails = (request: WalletTopUpRequest) => {
        setSelectedRequest(request);
        setIsDialogOpen(true);
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedRequest) return;
        setIsProcessing(true);

        try {
            const result = await handleWalletRequest({
                requestId: selectedRequest.id,
                userId: selectedRequest.userId,
                amount: selectedRequest.amount,
                action: action,
            });

            if (result.success) {
                toast({ title: 'সফল', description: result.message });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'অপারেশন ব্যর্থ হয়েছে',
                description: error.message || 'একটি অজানা ত্রুটি ঘটেছে।',
            });
        } finally {
            setIsProcessing(false);
            setIsDialogOpen(false);
        }
    };

    if (isLoading) {
      return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">ওয়ালেট টপ-আপ অনুরোধ</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>অনুরোধ ম্যানেজ করুন</CardTitle>
          <CardDescription>
            ব্যবহারকারীদের ওয়ালেট রিচার্জের অনুরোধ পর্যালোচনা ও অনুমোদন করুন।
          </CardDescription>
           <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="ব্যবহারকারী বা আইডি দিয়ে খুঁজুন..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ব্যবহারকারী</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead>পদ্ধতি</TableHead>
                <TableHead>তারিখ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>
                  <span className="sr-only">একশন</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests?.map((request) => (
                <TableRow key={request.transactionId || request.requestDate}>
                  <TableCell className="font-medium">{request.userEmail}</TableCell>
                  <TableCell>৳{request.amount.toFixed(2)}</TableCell>
                  <TableCell>{request.method}</TableCell>
                  <TableCell>{new Date(request.requestDate).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(request)}>
                        <Eye className='h-4 w-4 mr-2' />
                        দেখুন
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>অনুরোধের বিস্তারিত</DialogTitle>
              <DialogDescription>
                ব্যবহারকারীর পেমেন্টের তথ্য যাচাই করুন।
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
                <div className="grid gap-4 py-4">
                    <div className="space-y-1">
                        <Label>ব্যবহারকারী:</Label>
                        <p className="font-semibold">{selectedRequest.userEmail}</p>
                    </div>
                     <div className="space-y-1">
                        <Label>পরিমাণ:</Label>
                        <p className="font-semibold">৳{selectedRequest.amount.toFixed(2)}</p>
                    </div>
                     <div className="space-y-1">
                        <Label>প্রেরকের নম্বর:</Label>
                        <p className="font-semibold font-mono">{selectedRequest.senderPhone}</p>
                    </div>
                    <div className="space-y-1">
                        <Label>ট্রানজেকশন আইডি:</Label>
                        <p className="font-semibold font-mono">{selectedRequest.transactionId || 'N/A'}</p>
                    </div>
                     <div className="space-y-1">
                        <Label>পেমেন্ট পদ্ধতি:</Label>
                        <p className="font-semibold">{selectedRequest.method}</p>
                    </div>
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
              {selectedRequest?.status === 'Pending' && (
                  <>
                    <Button variant="destructive" onClick={() => handleAction('reject')} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <X className="mr-2 h-4 w-4" /> বাতিল করুন
                    </Button>
                    <Button onClick={() => handleAction('approve')} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Check className="mr-2 h-4 w-4" /> অনুমোদন দিন
                    </Button>
                  </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}
