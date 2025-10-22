'use client';
import * as React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order, User } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader2 } from "lucide-react";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit, where } from 'firebase/firestore';
import { useEffect, useMemo, useCallback } from 'react';
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";

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

const UserInfo = ({ userId }: { userId: string }) => {
    const firestore = useFirestore();
    const userRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', userId) : null, [firestore, userId]);
    const { data: user, isLoading } = useDoc<User>(userRef);

    if(isLoading) return <span className="font-bold text-sm">Loading...</span>

    return <p className="font-bold text-sm">{user?.name || 'Unknown User'}</p>
}

export default function RecentOrders() {
    const firestore = useFirestore();
    const { appUser } = useAuthContext();
    
    const recentOrdersQuery = useMemoFirebase(() => {
        if (!firestore || !appUser) return null;

        // Admins can see all recent orders
        if (appUser.isAdmin) {
             return query(
                collection(firestore, 'orders'), 
                orderBy('orderDate', 'desc'), 
                limit(10)
            );
        }

        // Regular users see only their own recent orders
        return query(
            collection(firestore, 'orders'),
            where('userId', '==', appUser.id),
            orderBy('orderDate', 'desc'),
            limit(10)
        );

    }, [firestore, appUser]);

    const { data: recentOrders, isLoading, error } = useCollection<Order>(recentOrdersQuery);
    
    useEffect(() => {
      if (error) {
        console.error('RecentOrders Firestore Error:', error);
      }
    }, [error]);

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
                                <UserAvatar userId={order.userId} />
                                <div className="flex-grow">
                                    <UserInfo userId={order.userId} />
                                    <p className="text-xs text-muted-foreground">{order.productOption} - <span className="font-semibold text-primary">{order.totalAmount.toFixed(0)}৳</span></p>
                                </div>
                                <Badge className={cn("rounded-full px-3 py-1 text-xs", getStatusBadgeVariant(order.status))}>
                                    {order.status}
                                </Badge>
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
