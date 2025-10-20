'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { orders, type Order } from '@/lib/data';
import OrderUpdateNotifier from '@/components/OrderUpdateNotifier';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CartTab from '@/components/CartTab';
import { useCart } from '@/contexts/CartContext';

const getStatusVariant = (status: Order['status']) => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'Pending':
      return 'secondary';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const OrderList = ({ status }: { status: Order['status'] | 'Cancelled' }) => {
    const filteredOrders = orders.filter(order => {
        if (status === 'Cancelled') {
            return order.status === 'Cancelled';
        }
        return order.status === status;
    });

    if (filteredOrders.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No {status.toLowerCase()} orders found.</p>
    }

    return (
        <div className="space-y-4">
            {filteredOrders.map((order) => (
            <Card key={order.id}>
                <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                    <CardTitle>Order {order.id}</CardTitle>
                    <CardDescription>Date: {order.date}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </div>
                </CardHeader>
                <CardContent>
                <p className="font-medium">{order.items}</p>
                <p className="text-muted-foreground">Total: ${order.total.toFixed(2)}</p>
                </CardContent>
                <CardFooter className="flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Button variant="outline" className="flex-grow">View Details</Button>
                    {order.status === 'Pending' && (
                        <OrderUpdateNotifier order={order} />
                    )}
                </CardFooter>
            </Card>
            ))}
        </div>
    );
};

export default function OrdersPage() {
    const { cartCount } = useCart();

  return (
    <div className="container mx-auto px-4 py-6 fade-in">
        <h1 className="text-3xl font-bold font-headline mb-6">My Orders</h1>
        
        <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="cart">Cart {cartCount > 0 && `(${cartCount})`}</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Failed/Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value="cart">
                <CartTab />
            </TabsContent>
            <TabsContent value="pending">
                <OrderList status="Pending" />
            </TabsContent>
            <TabsContent value="completed">
                <OrderList status="Completed" />
            </TabsContent>
            <TabsContent value="cancelled">
                <OrderList status="Cancelled" />
            </TabsContent>
        </Tabs>
    </div>
  );
}
