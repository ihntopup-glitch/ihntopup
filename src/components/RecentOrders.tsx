'use client';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order, User } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader2 } from "lucide-react";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { useAuthContext } from "@/contexts/AuthContext";

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

const UserAvatar = ({ userId }: { userId: string }) => {
    const firestore = useFirestore();
    const userRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', userId) : null, [firestore, userId]);
    const { data: user, isLoading } = useDoc<User>(userRef);
    
    if (isLoading) return <Avatar className="h-10 w-10"><AvatarFallback><Loader2 className="h-4 w-4 animate-spin"/></AvatarFallback></Avatar>
    
    const fallback = user?.name ? user.name.substring(0, 2) : (user?.email ? user.email.charAt(0) : 'U');
    
    return (
        <Avatar className="h-10 w-10">
            {user?.photoURL && <AvatarImage src={user.photoURL} />}
            <AvatarFallback className="bg-primary text-primary-foreground">{fallback}</AvatarFallback>
        </Avatar>
    )
}

export default function RecentOrders() {
    const { user: authUser } = useAuthContext();
    const firestore = useFirestore();
    const recentOrdersQuery = useMemoFirebase(() => 
        firestore ? query(
            collection(firestore, 'orders'), 
            orderBy('orderDate', 'desc'), 
            limit(5)
        ) : null, 
        [firestore]
    );
    const { data: recentOrders, isLoading } = useCollection<Order>(recentOrdersQuery);

    return (
        <section className="mt-8">
            <Card className="rounded-2xl shadow-lg bg-card/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold font-headline">Latest Orders</CardTitle>
                    <CardDescription>Last updated just now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                    {isLoading && (
                         <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         </div>
                    )}
                    {!isLoading && recentOrders?.map((order) => (
                        <Card key={order.id} className="p-3 shadow-sm bg-background/50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <UserAvatar userId={order.userId} />
                                <div className="flex-grow">
                                    <p className="font-bold text-sm">{order.topUpCardId}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(order.orderDate).toLocaleDateString()} - <span className="font-semibold text-primary">{order.totalAmount.toFixed(0)}৳</span></p>
                                </div>
                                <Badge variant={getStatusVariant(order.status)} className="bg-green-500 text-white rounded-full px-3 py-1 text-xs">
                                    {order.status.toLowerCase()}
                                </Badge>
                            </div>
                        </Card>
                    ))}
                     {!isLoading && (!recentOrders || recentOrders.length === 0) && (
                        <p className="text-muted-foreground text-center py-4">No recent orders.</p>
                     )}
                </CardContent>
            </Card>
        </section>
    );
}
