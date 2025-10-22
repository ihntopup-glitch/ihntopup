'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowRight, Box, CheckCircle, Clock, Search, ShoppingCart, XCircle, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import OrderDetailDialog from '@/components/OrderDetailDialog';
import { useCart } from '@/contexts/CartContext';
import CartTab from '@/components/CartTab';
import type { Order } from '@/lib/data';
import { useAuthContext } from '@/contexts/AuthContext';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';


const getStatusStyles = (status: Order['status']) => {
  switch (status) {
    case 'Completed':
      return {
        variant: 'default',
        className: 'bg-green-100 text-green-800 border-green-300',
        icon: CheckCircle,
      };
    case 'Pending':
      return {
        variant: 'secondary',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: Clock,
      };
    case 'Cancelled':
      return {
        variant: 'destructive',
        className: 'bg-red-100 text-red-800 border-red-300',
        icon: XCircle,
      };
    default:
      return {
        variant: 'outline',
        className: '',
        icon: Clock,
      };
  }
};

const StatCard = ({ title, value, color, icon: Icon }: { title: string; value: number; color: string; icon: React.ElementType }) => (
  <Card className={cn("shadow-md border-l-4", color)}>
    <CardContent className="p-4 flex items-center gap-3">
        <Icon className={cn("h-6 w-6", color.replace('border-', 'text-'))} />
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </CardContent>
  </Card>
);

const OrderItem = ({ order, onViewDetails }: { order: Order, onViewDetails: (order: Order) => void }) => {
  const statusStyle = getStatusStyles(order.status);
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
            <div className="bg-muted p-3 rounded-lg">
                <Box className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-grow">
                <p className="font-bold">{order.productName || order.topUpCardId}</p>
                 <p className="text-sm text-muted-foreground">{order.productOption}</p>
                <p className="text-xs text-muted-foreground">ID: <span className='font-mono'>{order.id.toLowerCase()}</span></p>
                <p className="text-sm text-muted-foreground">UID: {order.gameUid}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.orderDate).toLocaleString()}</p>
            </div>
             <div className="flex flex-col items-end gap-2">
                <p className="font-bold text-lg text-primary">৳{order.totalAmount.toFixed(2)}</p>
                <Badge className={cn("text-xs", statusStyle.className)}>{order.status}</Badge>
            </div>
        </div>
        <div className="flex justify-end items-center mt-3 pt-3 border-t">
            <button onClick={() => onViewDetails(order)} className="flex items-center text-sm text-primary font-semibold hover:underline">
                View Details <ArrowRight className="h-4 w-4 ml-1" />
            </button>
        </div>
      </CardContent>
    </Card>
  );
};


export default function OrdersPage() {
  const { user } = useAuthContext();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/orders`), orderBy('orderDate', 'desc'));
  }, [user?.uid, firestore]);
  
  const { data: orders, isLoading: isLoadingOrders } = useCollection<Order>(ordersQuery);

  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed' | 'Cancelled' | 'Cart'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { cartCount } = useCart();

  const orderCounts = useMemo(() => {
    return {
      All: orders?.length ?? 0,
      Pending: orders?.filter(o => o.status === 'Pending').length ?? 0,
      Completed: orders?.filter(o => o.status === 'Completed').length ?? 0,
      Cancelled: orders?.filter(o => o.status === 'Cancelled').length ?? 0,
      Cart: cartCount,
    }
  }, [orders, cartCount]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'Cart' || !orders) return [];

    let filtered = orders;
    
    if (activeTab !== 'All') {
        filtered = filtered.filter(order => order.status === activeTab);
    }

    if (searchTerm) {
        filtered = filtered.filter(order => 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            order.gameUid.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return filtered;
  }, [activeTab, searchTerm, orders]);

  const tabs: ('All' | 'Cart' | 'Pending' | 'Completed' | 'Cancelled')[] = ['All', 'Cart', 'Pending', 'Completed', 'Cancelled'];

  return (
    <>
        <div className="container mx-auto px-4 py-6 fade-in">
            <div className="flex items-center gap-2 mb-6">
                <h1 className="text-3xl font-bold font-headline">My Orders</h1>
                <Box className="h-7 w-7 text-primary" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <StatCard title="Total Orders" value={orderCounts.All} color="border-blue-500" icon={Box} />
                <StatCard title="In Cart" value={orderCounts.Cart} color="border-primary" icon={ShoppingCart} />
                <StatCard title="Pending" value={orderCounts.Pending} color="border-yellow-500" icon={Clock} />
                <StatCard title="Completed" value={orderCounts.Completed} color="border-green-500" icon={CheckCircle} />
                <StatCard title="Cancelled" value={orderCounts.Cancelled} color="border-red-500" icon={XCircle} />
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by Order ID or User..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={activeTab === 'Cart'}
                />
            </div>
            
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-6">
                {tabs.map(tab => (
                    <Button 
                        key={tab}
                        variant={activeTab === tab ? 'default' : 'outline'}
                        onClick={() => setActiveTab(tab)}
                        className={cn("rounded-full flex-shrink-0", {
                            "bg-primary text-white hover:bg-primary/90": activeTab === tab,
                        })}
                    >
                        {tab} ({orderCounts[tab]})
                    </Button>
                ))}
            </div>
            
            {activeTab === 'Cart' ? (
                <CartTab />
            ) : isLoadingOrders ? (
                 <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <OrderItem key={order.id} order={order} onViewDetails={setSelectedOrder} />
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No orders found.</p>
                    )}
                </div>
            )}
        </div>
        {selectedOrder && (
            <OrderDetailDialog 
                order={selectedOrder}
                open={!!selectedOrder}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setSelectedOrder(null);
                    }
                }}
            />
        )}
    </>
  );
}
