'use client';

import * as React from 'react';
import { MoreHorizontal, Search, Eye, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { handleWalletRequest } from '@/ai/flows/handle-wallet-request';
import { useAuthContext } from '@/contexts/AuthContext';
import type { WalletTopUpRequest } from '@/lib/data';

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
  const { appUser } = useAuthContext();
  const { toast } = useToast();
  
  const [requests, setRequests] = React.useState<WalletTopUpRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedRequest, setSelectedRequest] = React.useState<WalletTopUpRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (appUser?.isAdmin) {
      const fetchRequests = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/admin/wallet-requests');
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Failed to fetch wallet requests.');
          }
          const data = await response.json();
          setRequests(data);
        } catch (err: any) {
          setError(err.message);
          toast({
            variant: 'destructive',
            title: 'Failed to load requests',
            description: err.message,
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchRequests();
    } else if (appUser !== null) {
        setIsLoading(false);
        setError("You don't have permission to view this page.");
    }
  }, [appUser, toast]);

  const handleViewDetails = (request: WalletTopUpRequest) => {
    setSelectedRequest(request);
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      const result = await handleWalletRequest({
        requestId: selectedRequest.id,
        userId: selectedRequest.userId,
        amount: selectedRequest.amount,
        action: action,
      });

      if (result.success) {
        toast({ title: 'Operation Successful', description: result.message });
        setRequests(prev => prev.map(r => r.id === selectedRequest.id ? { ...r, status: action === 'approve' ? 'Approved' : 'Rejected' } : r));
        setSelectedRequest(null);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error(`Failed to ${action} request:`, error);
      toast({
        variant: 'destructive',
        title: 'Operation Failed',
        description: error.message || `Could not ${action} the request.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (error) {
     return <div className="flex justify-center items-center h-screen text-destructive">{error}</div>;
  }
  
  if (!appUser?.isAdmin) {
    return <div className="flex justify-center items-center h-screen text-muted-foreground">Access Denied.</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">ওয়ালেট অনুরোধ</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ওয়ালেট টপ-আপ অনুরোধ</CardTitle>
          <CardDescription>ব্যবহারকারীদের ওয়ালেট টপ-আপ অনুরোধগুলো পর্যালোচনা এবং অনুমোদন করুন।</CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="ইমেইল বা ফোন নম্বর দিয়ে খুঁজুন..." className="pl-8 w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ব্যবহারকারী</TableHead>
                <TableHead>পরিমাণ</TableHead>
                <TableHead className="hidden sm:table-cell">পদ্ধতি</TableHead>
                <TableHead className="hidden md:table-cell">তারিখ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="text-right">অ্যাকশন</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="font-medium">{request.userEmail}</div>
                    <div className="text-sm text-muted-foreground">{request.senderPhone}</div>
                  </TableCell>
                  <TableCell className="font-bold">৳{request.amount}</TableCell>
                  <TableCell className="hidden sm:table-cell">{request.method}</TableCell>
                  <TableCell className="hidden md:table-cell">{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
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

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>অনুরোধের বিস্তারিত</DialogTitle>
            <DialogDescription>
              ID: <span className='font-mono'>{selectedRequest?.id}</span>
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">ব্যবহারকারী:</Label>
                <p className="col-span-2 font-medium">{selectedRequest.userEmail}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">পরিমাণ:</Label>
                <p className="col-span-2 font-bold text-lg">৳{selectedRequest.amount}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">প্রেরকের নম্বর:</Label>
                <p className="col-span-2">{selectedRequest.senderPhone}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">পেমেন্ট পদ্ধতি:</Label>
                <p className="col-span-2">{selectedRequest.method}</p>
              </div>
               {selectedRequest.transactionId && <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">ট্রানজেকশন আইডি:</Label>
                <p className="col-span-2 font-mono">{selectedRequest.transactionId}</p>
              </div>}
              <div className="grid grid-cols-3 items-center">
                <Label className="col-span-1">স্ট্যাটাস:</Label>
                <Badge className={getStatusBadgeVariant(selectedRequest.status)}>{selectedRequest.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === 'Pending' && (
              <>
                <Button variant="destructive" onClick={() => handleAction('reject')} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    বাতিল করুন
                </Button>
                <Button onClick={() => handleAction('approve')} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    অনুমোদন দিন
                </Button>
              </>
            )}
             <Button variant="outline" onClick={() => setSelectedRequest(null)}>বন্ধ করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
