'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, getDocs, doc, getDoc, DocumentData } from 'firebase/firestore';
import type { Order } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

// New type to hold combined order and user name info
type OrderWithUserName = Order & {
  finalUserName: string;
};

// Helper to get status badge styles
const getStatusBadgeVariant = (status: Order['status']) => {
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

export default function RecentOrders() {
  const firestore = useFirestore();
  const [ordersWithNames, setOrdersWithNames] = useState<OrderWithUserName[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const fetchOrdersAndUsers = async () => {
      setIsLoading(true);
      const recentOrdersQuery = query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'), limit(10));
      
      try {
        const orderSnapshot = await getDocs(recentOrdersQuery);
        const orders = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        const enhancedOrders = await Promise.all(
          orders.map(async (order) => {
            let finalUserName = order.userName;
            // If userName is not on the order, fetch it from the users collection
            if (!finalUserName && order.userId) {
              try {
                const userDocRef = doc(firestore, 'users', order.userId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data();
                  finalUserName = userData.name || `User...`;
                }
              } catch (userError) {
                console.error(`Failed to fetch user ${order.userId}`, userError);
              }
            }
            
            return {
              ...order,
              finalUserName: finalUserName || 'Guest User',
            };
          })
        );
        
        setOrdersWithNames(enhancedOrders);
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdersAndUsers();
  }, [firestore]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <CardTitle>সর্বশেষ অর্ডার</CardTitle>
        </div>
        <CardDescription>আমাদের ওয়েবসাইটে সর্বশেষ সম্পন্ন হওয়া কিছু অর্ডার দেখুন।</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {ordersWithNames.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10 border-2 border-primary/50">
                  <AvatarFallback>{order.finalUserName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold text-sm">{order.finalUserName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Package className="h-3 w-3" />
                    {order.productName} - {order.productOption}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-primary">৳{order.totalAmount.toFixed(2)}</p>
                  <Badge variant="outline" className={cn("text-xs mt-1", getStatusBadgeVariant(order.status))}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
            {ordersWithNames.length === 0 && (
                <p className='text-center text-muted-foreground py-8'>এখনো কোনো অর্ডার করা হয়নি।</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
