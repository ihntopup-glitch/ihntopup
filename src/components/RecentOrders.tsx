'use client';
import * as React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order, User } from "@/lib/data";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, getDoc, Firestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";

const getStatusBadgeVariant = (status: Order['status']) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Cancelled':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const UserAvatar = ({ userName }: { userName: string }) => {
    const fallback = userName ? userName.substring(0, 2).toUpperCase() : 'GU';
    
    return (
        <div className='flex items-center gap-4'>
            <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">{fallback}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <p className="font-bold text-sm">{userName}</p>
            </div>
        </div>
    )
}

type OrderWithUserName = Order & { finalUserName: string };

export default function RecentOrders() {
    const firestore = useFirestore();
    const [ordersWithNames, setOrdersWithNames] = useState<OrderWithUserName[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const recentOrdersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'), limit(10));
    }, [firestore]);

    const { data: recentOrders, isLoading: isLoadingOrders, error: ordersError } = useCollection<Order>(recentOrdersQuery);
    
    useEffect(() => {
        if (ordersError) {
          console.error('RecentOrders Firestore Error:', ordersError);
          setError(ordersError.message);
        }
    }, [ordersError]);

    useEffect(() => {
        if (isLoadingOrders) {
            setIsLoading(true);
            return;
        }

        if (!firestore || !recentOrders) {
            setIsLoading(false);
            setOrdersWithNames([]);
            return;
        }
        
        const fetchAndSetUserNames = async () => {
            try {
                const enrichedOrders = await Promise.all(
                    recentOrders.map(async (order) => {
                        let finalUserName = order.userName;
                        if (!finalUserName) {
                             try {
                                const userDocRef = doc(firestore, 'users', order.userId);
                                const userDocSnap = await getDoc(userDocRef);
                                if (userDocSnap.exists()) {
                                    const userData = userDocSnap.data() as User;
                                    finalUserName = userData.name || `User ${order.userId.substring(0,4)}`;
                                } else {
                                    finalUserName = `User ${order.userId.substring(0,4)}`;
                                }
                            } catch (e) {
                                console.error(`Failed to fetch user ${order.userId}`, e);
                                finalUserName = `User ${order.userId.substring(0,4)}`; // Fallback on error
                            }
                        }
                        return { ...order, finalUserName: finalUserName || 'Unknown' };
                    })
                );
                setOrdersWithNames(enrichedOrders);
            } catch (e) {
                 console.error('Error enriching orders with usernames:', e);
                 setError('Could not load user names for orders.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndSetUserNames();

    }, [firestore, recentOrders, isLoadingOrders]);

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
                    {error && (
                        <div className="text-center py-4 text-destructive">
                            Error loading orders: {error}
                        </div>
                    )}
                    {!isLoading && !error && ordersWithNames.map((order) => {
                        return (
                            <Card key={order.id} className="p-3 shadow-sm bg-background/50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="flex-grow">
                                        <UserAvatar userName={order.finalUserName} />
                                    </div>
                                    <div className='flex-shrink-0 flex flex-col items-end'>
                                        <p className="font-semibold text-primary">{order.totalAmount.toFixed(0)}৳ - <span className='text-muted-foreground font-normal'>{order.productOption}</span></p>
                                        <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-xs mt-1", getStatusBadgeVariant(order.status))} >
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                     {!isLoading && !error && (!ordersWithNames || ordersWithNames.length === 0) && (
                        <p className="text-muted-foreground text-center py-4">No recent orders.</p>
                     )}
                </CardContent>
            </Card>
        </section>
    );
}
