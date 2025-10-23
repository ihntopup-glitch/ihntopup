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

const fetchUserNames = async (firestore: Firestore, orders: Order[]): Promise<Map<string, string>> => {
    const userIds = [...new Set(orders.map(order => order.userId))];
    const usersMap = new Map<string, string>();
    
    const userPromises = userIds.map(async (userId) => {
        try {
            const userDocRef = doc(firestore, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data() as User;
                usersMap.set(userId, userData.name || 'Guest');
            } else {
                usersMap.set(userId, 'Guest');
            }
        } catch (error) {
            console.error(`Failed to fetch user ${userId}`, error);
            usersMap.set(userId, 'Guest');
        }
    });

    await Promise.all(userPromises);
    return usersMap;
};

export default function RecentOrders() {
    const firestore = useFirestore();
    const [usersMap, setUsersMap] = useState<Map<string, string>>(new Map());
    const [isFetchingNames, setIsFetchingNames] = useState(true);
    
    const recentOrdersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'), limit(10));
    }, [firestore]);

    const { data: recentOrders, isLoading: isLoadingOrders, error } = useCollection<Order>(recentOrdersQuery);
    
    useEffect(() => {
      if (error) {
        console.error('RecentOrders Firestore Error:', error);
      }
    }, [error]);

    useEffect(() => {
        if (firestore && recentOrders && recentOrders.length > 0) {
            setIsFetchingNames(true);
            fetchUserNames(firestore, recentOrders)
                .then(map => {
                    setUsersMap(map);
                    setIsFetchingNames(false);
                });
        } else if (recentOrders?.length === 0) {
            setIsFetchingNames(false);
        }
    }, [firestore, recentOrders]);

    const isLoading = isLoadingOrders || isFetchingNames;

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
                            Error loading orders: {error.message}
                        </div>
                    )}
                    {!isLoading && !error && recentOrders?.map((order) => (
                        <Card key={order.id} className="p-3 shadow-sm bg-background/50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="flex-grow">
                                    <UserAvatar userName={usersMap.get(order.userId) || 'Guest'} />
                                </div>
                                <div className='flex-shrink-0 flex flex-col items-end'>
                                    <p className="font-semibold text-primary">{order.totalAmount.toFixed(0)}৳ - <span className='text-muted-foreground font-normal'>{order.productOption}</span></p>
                                    <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-xs mt-1", getStatusBadgeVariant(order.status))} >
                                        {order.status}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    ))}
                     {!isLoading && !error && (!recentOrders || recentOrders.length === 0) && (
                        <p className="text-muted-foreground text-center py-4">No recent orders.</p>
                     )}
                </CardContent>
            </Card>
        </section>
    );
}
