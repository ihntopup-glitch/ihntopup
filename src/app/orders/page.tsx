'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { orders, type Order } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowRight, Box, CheckCircle, Clock, Gem, Search, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import OrderDetailDialog from '@/components/OrderDetailDialog';

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

const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
  <Card className={cn("shadow-md border-l-4", color)}>
    <CardContent className="p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

const OrderItem = ({ order, onViewDetails }: { order: Order, onViewDetails: (order: Order) => void }) => {
  const statusStyle = getStatusStyles(order.status);
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
            <div className="bg-yellow-100 p-2 rounded-lg">
                <Gem className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex-grow">
                <p className="text-xs text-muted-foreground truncate">#{order.id.toLowerCase()}</p>
                <p className="font-bold">{order.items}</p>
                <p className="text-sm text-muted-foreground">UID: {order.user.length > 5 ? '...'+order.id.slice(-5) : order.id.slice(-7)}</p>
                <p className="text-xs text-muted-foreground">{order.date}</p>
            </div>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t">
            <p className="font-bold text-lg text-primary">৳{order.total.toFixed(2)}</p>
            <div className='flex items-center gap-4'>
                <Badge className={cn("text-xs", statusStyle.className)}>{order.status}</Badge>
                <button onClick={() => onViewDetails(order)} className="flex items-center text-sm text-green-600 font-semibold hover:underline">
                    View Details <ArrowRight className="h-4 w-4 ml-1" />
                </button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};


export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed' | 'Cancelled'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orderCounts = useMemo(() => {
    return {
      All: orders.length,
      Pending: orders.filter(o => o.status === 'Pending').length,
      Completed: orders.filter(o => o.status === 'Completed').length,
      Cancelled: orders.filter(o => o.status === 'Cancelled').length,
    }
  }, []);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (activeTab !== 'All') {
        filtered = filtered.filter(order => order.status === activeTab);
    }

    if (searchTerm) {
        filtered = filtered.filter(order => 
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (order.user.length > 5 ? '...'+order.id.slice(-5) : order.id.slice(-7)).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return filtered;
  }, [activeTab, searchTerm]);

  const tabs: ('All' | 'Pending' | 'Completed' | 'Cancelled')[] = ['All', 'Pending', 'Completed', 'Cancelled'];

  return (
    <>
        <div className="container mx-auto px-4 py-6 fade-in">
            <div className="flex items-center gap-2 mb-6">
                <h1 className="text-3xl font-bold font-headline">My Orders</h1>
                <Box className="h-7 w-7 text-yellow-600" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Orders" value={orderCounts.All} color="border-blue-500" />
                <StatCard title="Pending" value={orderCounts.Pending} color="border-yellow-500" />
                <StatCard title="Completed" value={orderCounts.Completed} color="border-green-500" />
                <StatCard title="Cancelled" value={orderCounts.Cancelled} color="border-red-500" />
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search by Order ID or UID..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 mb-6">
                {tabs.map(tab => (
                    <Button 
                        key={tab}
                        variant={activeTab === tab ? 'default' : 'outline'}
                        onClick={() => setActiveTab(tab)}
                        className={cn("rounded-full flex-shrink-0", {
                            "bg-green-600 text-white hover:bg-green-700": activeTab === tab,
                        })}
                    >
                        {tab} ({orderCounts[tab]})
                    </Button>
                ))}
            </div>
            
            <div className="space-y-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <OrderItem key={order.id} order={order} onViewDetails={setSelectedOrder} />
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-8">No orders found.</p>
                )}
            </div>
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