'use client';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/lib/data";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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

const UserAvatar = ({ name, email }: { name?: string | null, email?: string | null }) => {
    const fallback = name ? name.substring(0, 2) : (email ? email.charAt(0) : 'U');
    return (
        <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">{fallback}</AvatarFallback>
        </Avatar>
    )
}

export default function RecentOrders() {
    const [isLoading, setIsLoading] = useState(false);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

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
                                <UserAvatar name={order.userId} /> {/* Using userId as name for now */}
                                <div className="flex-grow">
                                    <p className="font-bold text-sm">{order.userId.substring(0,8)}...</p>
                                    <p className="text-xs text-muted-foreground">{order.topUpCardId} - <span className="font-semibold text-primary">{order.totalAmount.toFixed(0)}৳</span></p>
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
