import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { orders } from "@/lib/data";
import type { Order } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { userProfile } from "@/lib/data";
import Image from "next/image";

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

const UserAvatar = ({ name }: { name: string }) => {
    const user = userProfile;
    // Find a user from a list if available, otherwise use a fallback.
    // For now, we'll randomly show the main user avatar or a fallback.
    if (Math.random() > 0.5) {
        return (
             <Avatar className="h-10 w-10">
                <AvatarImage asChild src={user.avatar.src}>
                    <Image src={user.avatar.src} alt={user.name} width={40} height={40} data-ai-hint={user.avatar.hint}/>
                </AvatarImage>
                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
        )
    }
    return (
        <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">{name.substring(0, 2)}</AvatarFallback>
        </Avatar>
    )
}

export default function RecentOrders() {
    const recentOrders = orders.slice(0, 6);

    return (
        <section className="mt-8">
            <Card className="rounded-2xl shadow-lg bg-card">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold font-headline">Latest Orders</CardTitle>
                    <CardDescription>Last updated 3 minutes ago</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-4">
                    {recentOrders.map((order) => (
                        <Card key={order.id} className="p-3 shadow-sm">
                            <div className="flex items-center gap-4">
                                <UserAvatar name={order.user} />
                                <div className="flex-grow">
                                    <p className="font-bold text-sm">{order.user}</p>
                                    <p className="text-xs text-muted-foreground">{order.items} - <span className="font-semibold text-primary">{order.total.toFixed(0)}৳</span></p>
                                </div>
                                <Badge variant={getStatusVariant(order.status)} className="bg-green-500 text-white rounded-full px-3 py-1 text-xs">
                                    {order.status.toLowerCase()}
                                </Badge>
                            </div>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </section>
    );
}
