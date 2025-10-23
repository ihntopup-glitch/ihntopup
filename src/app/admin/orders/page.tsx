'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  File,
  ListFilter,
  Search,
  Check,
  X,
  Clock,
  Loader2,
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Order } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


type OrderStatus = Order['status'];

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


export default function OrdersPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
    const [currentStatus, setCurrentStatus] = React.useState<OrderStatus | undefined>(undefined);
    const [cancellationReason, setCancellationReason] = React.useState('');
    const { toast } = useToast();

    const firestore = useFirestore();

    const allOrdersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'orders')) : null, [firestore]);
    const fulfilledOrdersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'orders'), where('status', '==', 'Completed')) : null, [firestore]);
    const pendingOrdersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'orders'), where('status', '==', 'Pending')) : null, [firestore]);
    const cancelledOrdersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'orders'), where('status', '==', 'Cancelled')) : null, [firestore]);
    
    const { data: allOrders, isLoading: isLoadingAll } = useCollection<Order>(allOrdersQuery);
    const { data: fulfilledOrders, isLoading: isLoadingFulfilled } = useCollection<Order>(fulfilledOrdersQuery);
    const { data: pendingOrders, isLoading: isLoadingPending } = useCollection<Order>(pendingOrdersQuery);
    const { data: cancelledOrders, isLoading: isLoadingCancelled } = useCollection<Order>(cancelledOrdersQuery);


    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setCurrentStatus(order.status);
        setCancellationReason('');
        setIsDialogOpen(true);
    }

    const handleSaveChanges = async () => {
        if (!selectedOrder || !currentStatus || !firestore) return;

        const orderDocRef = doc(firestore, 'orders', selectedOrder.id);
        
        try {
            await updateDoc(orderDocRef, { status: currentStatus });
            toast({
                title: "অর্ডার আপডেট করা হয়েছে",
                description: `অর্ডার ${selectedOrder.id} এখন ${currentStatus}।`
            });
            // In a real app, you might send a notification here.
            if (currentStatus === 'Cancelled') {
                console.log(`বাতিলের কারণ ${selectedOrder.id}: ${cancellationReason}`);
            }
        } catch (error) {
             toast({
                variant: 'destructive',
                title: "আপডেট ব্যর্থ হয়েছে",
                description: "অর্ডারের স্ট্যাটাস আপডেট করা যায়নি।"
            });
        } finally {
            setIsDialogOpen(false);
        }
    }
    
    const statusOptions: {value: OrderStatus, label: string, icon: React.ElementType}[] = [
        { value: 'Pending', label: 'পেন্ডিং', icon: Clock },
        { value: 'Completed', label: 'সম্পন্ন', icon: Check },
        { value: 'Cancelled', label: 'বাতিল', icon: X },
    ]
    
    const renderTable = (orders: Order[] | null, isLoading: boolean) => {
        if (isLoading) {
             return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>;
        }
        
        if (!orders || orders.length === 0) {
            return <div className="text-center p-8 text-muted-foreground">এই ক্যাটাগরিতে কোনো অর্ডার পাওয়া যায়নি।</div>;
        }

        return (
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ক্রেতা</TableHead>
                    <TableHead className="hidden sm:table-cell">প্রোডাক্ট</TableHead>
                    <TableHead className="hidden sm:table-cell">স্ট্যাটাস</TableHead>
                    <TableHead className="hidden md:table-cell">তারিখ</TableHead>
                    <TableHead className="text-right">পরিমাণ</TableHead>
                    <TableHead>
                        <span className="sr-only">একশন</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.userId}</div>
                        <div className="text-sm text-muted-foreground md:hidden">
                            {order.productName || order.topUpCardId}
                        </div>
                      </TableCell>
                       <TableCell className="hidden sm:table-cell">{order.productName || order.topUpCardId}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={getStatusBadgeVariant(order.status)} variant="outline">
                          {order.status === 'Pending' ? 'পেন্ডিং' : order.status === 'Completed' ? 'সম্পন্ন' : 'বাতিল'}
                        </Badge>
                      </TableCell>
                       <TableCell className="hidden md:table-cell">{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                       <TableCell className="text-right">৳{order.totalAmount.toFixed(2)}</TableCell>
                       <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">মেনু</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>একশন</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => handleViewDetails(order)}>বিস্তারিত দেখুন</DropdownMenuItem>
                              <DropdownMenuItem>মুছে ফেলুন</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
        );
    }

  return (
    <>
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">সব</TabsTrigger>
            <TabsTrigger value="fulfilled">সম্পন্ন</TabsTrigger>
            <TabsTrigger value="pending">পেন্ডিং</TabsTrigger>
            <TabsTrigger value="cancelled">বাতিল</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                এক্সপোর্ট
              </span>
            </Button>
          </div>
        </div>
        <Card className='mt-4'>
            <CardHeader>
              <CardTitle>অর্ডারসমূহ</CardTitle>
              <CardDescription>
                আপনার অর্ডার ম্যানেজ করুন এবং বিস্তারিত দেখুন।
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="অর্ডার খুঁজুন..." className="pl-8 w-full" />
              </div>
            </CardHeader>
            <CardContent>
                <TabsContent value="all">{renderTable(allOrders, isLoadingAll)}</TabsContent>
                <TabsContent value="fulfilled">{renderTable(fulfilledOrders, isLoadingFulfilled)}</TabsContent>
                <TabsContent value="pending">{renderTable(pendingOrders, isLoadingPending)}</TabsContent>
                <TabsContent value="cancelled">{renderTable(cancelledOrders, isLoadingCancelled)}</TabsContent>
            </CardContent>
          </Card>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>অর্ডারের বিস্তারিত</DialogTitle>
              <DialogDescription>
                অর্ডার আইডি: {selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">{selectedOrder.productName || selectedOrder.topUpCardId}</h4>
                         <p className="text-sm text-muted-foreground">{selectedOrder.productOption}</p>
                        <p className="text-sm text-muted-foreground">
                            ব্যবহারকারী আইডি: {selectedOrder.userId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            গেম আইডি: {selectedOrder.gameUid}
                        </p>
                        <p className="font-bold text-lg">৳{selectedOrder.totalAmount.toFixed(2)}</p>
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="status">স্ট্যাটাস আপডেট করুন</Label>
                        <Select
                            value={currentStatus}
                            onValueChange={(value: OrderStatus) => setCurrentStatus(value)}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="স্ট্যাটাস নির্বাচন করুন" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map(option => (
                                     <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center gap-2">
                                            <option.icon className="h-4 w-4" />
                                            {option.label}
                                        </div>
                                     </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     {currentStatus === 'Cancelled' && (
                        <div className="space-y-2">
                            <Label htmlFor="reason">বাতিলের কারণ</Label>
                            <Textarea
                                id="reason"
                                placeholder="অর্ডারটি কেন বাতিল করা হয়েছে তা ব্যাখ্যা করুন..."
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
              <Button onClick={handleSaveChanges}>পরিবর্তন সংরক্ষণ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}
