'use client';
import * as React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader2 } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useEffect } from 'react';
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

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

const UserAvatar = ({ order }: { order: Order }) => {
    const displayName = order.userName || 'Guest User';
    const fallback = order.userName ? order.userName.substring(0, 2).toUpperCase() : 'GU';
    
    return (
        <div className='flex items-center gap-4'>
            <Avatar className="h-10 w-10">
                {/* We don't have user photoURL in the order, so we always show fallback */}
                <AvatarFallback className="bg-primary text-primary-foreground">{fallback}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <p className="font-bold text-sm">{displayName}</p>
            </div>
        </div>
    )
}


export default function RecentOrders() {
    const firestore = useFirestore();
    
    const recentOrdersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'), limit(10));
    }, [firestore]);


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
                                <div className="flex-grow">
                                    <UserAvatar order={order} />
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
