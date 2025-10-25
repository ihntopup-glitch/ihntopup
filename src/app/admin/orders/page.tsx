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
  Wallet,
  CreditCard,
  User,
  Gamepad2,
  Hash,
  ShoppingBag,
  Calendar,
  DollarSign,
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
import type { Order, TopUpCardData } from '@/lib/data';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';


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
    const [activeTab, setActiveTab] = React.useState('all');

    const firestore = useFirestore();

    const allOrdersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'orders'), orderBy('orderDate', 'desc')) : null, [firestore]);
    const topUpCardsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'top_up_cards')) : null, [firestore]);
    
    const { data: allOrders, isLoading: isLoadingAll } = useCollection<Order>(allOrdersQuery);
    const { data: topUpCards, isLoading: isLoadingCards } = useCollection<TopUpCardData>(topUpCardsQuery);

    const productTabs = React.useMemo(() => {
        if (!topUpCards) return [];
        const productNames = topUpCards.map(card => card.name);
        return [...new Set(productNames)];
    }, [topUpCards]);


    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setCurrentStatus(order.status);
        setCancellationReason(order.cancellationReason || '');
        setIsDialogOpen(true);
    }

    const handleSaveChanges = async () => {
        if (!selectedOrder || !currentStatus || !firestore) return;

        const orderDocRef = doc(firestore, 'orders', selectedOrder.id);
        
        const dataToUpdate: Partial<Order> = { status: currentStatus };
        if (currentStatus === 'Cancelled') {
          dataToUpdate.cancellationReason = cancellationReason;
        }

        try {
            await updateDoc(orderDocRef, dataToUpdate);
            toast({
                title: "অর্ডার আপডেট করা হয়েছে",
                description: `অর্ডার ${selectedOrder.id.substring(0, 5)}... এখন ${currentStatus}।`
            });
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

        let filteredOrders = orders;
        if(activeTab !== 'all' && activeTab !== 'fulfilled' && activeTab !== 'pending' && activeTab !== 'cancelled') {
            filteredOrders = orders.filter(order => order.productName === activeTab);
        } else if (activeTab === 'fulfilled') {
            filteredOrders = orders.filter(order => order.status === 'Completed');
        } else if (activeTab === 'pending') {
            filteredOrders = orders.filter(order => order.status === 'Pending');
        } else if (activeTab === 'cancelled') {
            filteredOrders = orders.filter(order => order.status === 'Cancelled');
        }


        return (
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>প্রোডাক্ট</TableHead>
                    <TableHead className="text-right">স্ট্যাটাস</TableHead>
                    <TableHead>
                        <span className="sr-only">একশন</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.productName} - {order.productOption}</div>
                        <div className="text-sm text-muted-foreground">
                            {order.gameUid}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className={getStatusBadgeVariant(order.status)} variant="outline">
                          {order.status === 'Pending' ? 'পেন্ডিং' : order.status === 'Completed' ? 'সম্পন্ন' : 'বাতিল'}
                        </Badge>
                      </TableCell>
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

    const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: React.ReactNode }) => (
        <div className="flex items-start gap-3">
            <Icon className="h-4 w-4 text-muted-foreground mt-1" />
            <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <div className="font-semibold">{value}</div>
            </div>
        </div>
    );

  return (
    <>
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">সব</TabsTrigger>
            <TabsTrigger value="fulfilled">সম্পন্ন</TabsTrigger>
            <TabsTrigger value="pending">পেন্ডিং</TabsTrigger>
            <TabsTrigger value="cancelled">বাতিল</TabsTrigger>
            {productTabs.map(tabName => (
                 <TabsTrigger key={tabName} value={tabName}>{tabName}</TabsTrigger>
            ))}
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
                <TabsContent value={activeTab} forceMount>
                   {renderTable(allOrders, isLoadingAll || isLoadingCards)}
                </TabsContent>
            </CardContent>
          </Card>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>অর্ডারের বিস্তারিত</DialogTitle>
              <DialogDescription>
                অর্ডার আইডি: <span className='font-mono'>{selectedOrder?.id}</span>
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
                <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Order Details */}
                    <Card>
                        <CardHeader className='pb-4'>
                            <CardTitle className='text-base flex items-center gap-2'><ShoppingBag className='h-4 w-4'/> অর্ডারের বিবরণ</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <DetailRow icon={ShoppingBag} label="প্রোডাক্ট" value={`${selectedOrder.productName} - ${selectedOrder.productOption}`} />
                            <DetailRow icon={Hash} label="পরিমাণ" value={selectedOrder.quantity} />
                            <DetailRow icon={DollarSign} label="মোট মূল্য" value={`৳${selectedOrder.totalAmount.toFixed(2)}`} />
                             <DetailRow icon={Calendar} label="অর্ডারের সময়" value={new Date(selectedOrder.orderDate).toLocaleString()} />
                        </CardContent>
                    </Card>

                    {/* User Details */}
                    <Card>
                        <CardHeader className='pb-4'>
                            <CardTitle className='text-base flex items-center gap-2'><User className='h-4 w-4'/> ব্যবহারকারীর বিবরণ</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            <DetailRow icon={User} label="নাম" value={selectedOrder.userName} />
                            <DetailRow icon={Hash} label="ব্যবহারকারী আইডি" value={<span className='font-mono'>{selectedOrder.userId}</span>} />
                            <DetailRow icon={Gamepad2} label="গেম আইডি" value={<span className='font-mono'>{selectedOrder.gameUid}</span>} />
                        </CardContent>
                    </Card>
                    
                    {/* Payment Details */}
                     <Card>
                        <CardHeader className='pb-4'>
                            <CardTitle className='text-base flex items-center gap-2'><CreditCard className='h-4 w-4'/> পেমেন্টের বিবরণ</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3 text-sm'>
                            {selectedOrder.paymentMethod === 'Wallet' ? (
                                <div className="flex items-center gap-2 text-sm p-3 rounded-md bg-blue-50 border border-blue-200">
                                    <Wallet className='h-5 w-5 text-blue-500' />
                                    <p>পেমেন্ট মেথড: <span className='font-bold'>ওয়ালেট</span></p>
                                </div>
                            ) : (
                                 <div className="flex items-center gap-2 text-sm p-3 rounded-md bg-green-50 border border-green-200">
                                     <CreditCard className='h-5 w-5 text-green-500' />
                                     <p>পেমেন্ট মেথড: <span className='font-bold'>{selectedOrder.paymentMethod || 'ম্যানুয়াল / ইন্সট্যান্ট'}</span></p>
                                </div>
                            )}
                            
                            {selectedOrder.manualPaymentDetails && (
                                <div className='border rounded-lg p-3 space-y-3 bg-muted/50'>
                                    <DetailRow icon={CreditCard} label="মেথড" value={selectedOrder.manualPaymentDetails.method} />
                                    <DetailRow icon={Hash} label="প্রেরকের নম্বর" value={<span className='font-mono'>{selectedOrder.manualPaymentDetails.senderPhone}</span>} />
                                    {selectedOrder.manualPaymentDetails.transactionId && <DetailRow icon={Hash} label="লেনদেন আইডি" value={<span className='font-mono'>{selectedOrder.manualPaymentDetails.transactionId}</span>} />}
                                </div>
                            )}
                        </CardContent>
                    </Card>


                     <div className="space-y-2 pt-4">
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
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
              <Button onClick={handleSaveChanges}>পরিবর্তন সংরক্ষণ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}
