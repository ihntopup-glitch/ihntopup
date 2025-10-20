import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { orders } from "@/lib/data";
import type { Order } from "@/lib/data";

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

export default function RecentOrders() {
    const recentOrders = orders.slice(0, 10);

    return (
        <section className="mt-8">
            <h2 className="text-2xl font-bold font-headline mb-4">Live Orders</h2>
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Here's a look at the latest orders being processed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                    <TableCell className="font-medium">{order.items}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
    );
}
