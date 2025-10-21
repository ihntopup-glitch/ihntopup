'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  File,
  ListFilter,
  Search,
  Check,
  X,
  Clock,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const orders = [
    {
        id: 'ORD001',
        user: 'Liam Johnson',
        email: 'liam@example.com',
        product: 'Free Fire 1080 Diamonds',
        amount: '৳100.00',
        status: 'Fulfilled',
        date: '2023-06-23',
        gameUid: '123456789'
    },
    {
        id: 'ORD002',
        user: 'Olivia Smith',
        email: 'olivia@example.com',
        product: 'PUBG 600 UC',
        amount: '৳150.00',
        status: 'Pending',
        date: '2023-06-24',
        gameUid: '987654321'
    },
    {
        id: 'ORD003',
        user: 'Noah Williams',
        email: 'noah@example.com',
        product: 'Netflix 1 Month',
        amount: '৳350.00',
        status: 'Cancelled',
        date: '2023-06-25',
        gameUid: 'N/A'
    },
];

type Order = (typeof orders)[0];
type OrderStatus = Order['status'];

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'Fulfilled':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


export default function OrdersPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
    const [currentStatus, setCurrentStatus] = React.useState<OrderStatus | undefined>(undefined);
    const [cancellationReason, setCancellationReason] = React.useState('');

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setCurrentStatus(order.status);
        setCancellationReason('');
        setIsDialogOpen(true);
    }

    const handleSaveChanges = () => {
        if (selectedOrder) {
            console.log(`Order ${selectedOrder.id} status updated to ${currentStatus}`);
            if (currentStatus === 'Cancelled') {
                console.log(`Cancellation Reason: ${cancellationReason}`);
            }
            // Here you would typically call an API to update the order
        }
        setIsDialogOpen(false);
    }
    
    const statusOptions: {value: OrderStatus, label: string, icon: React.ElementType}[] = [
        { value: 'Pending', label: 'Pending', icon: Clock },
        { value: 'Fulfilled', label: 'Fulfilled', icon: Check },
        { value: 'Cancelled', label: 'Cancelled', icon: X },
    ]

  return (
    <>
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Fulfilled
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Pending</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Cancelled</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Manage your orders and view their details.
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search orders..." className="pl-8 w-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden sm:table-cell">Product</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>
                        <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.user}</div>
                        <div className="text-sm text-muted-foreground md:hidden">
                            {order.product}
                        </div>
                      </TableCell>
                       <TableCell className="hidden sm:table-cell">{order.product}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={getStatusBadgeVariant(order.status)} variant="outline">
                          {order.status}
                        </Badge>
                      </TableCell>
                       <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                       <TableCell className="text-right">{order.amount}</TableCell>
                       <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onSelect={() => handleViewDetails(order)}>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>
                Order ID: {selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">{selectedOrder.product}</h4>
                        <p className="text-sm text-muted-foreground">
                            {selectedOrder.user} ({selectedOrder.email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Game UID: {selectedOrder.gameUid}
                        </p>
                        <p className="font-bold text-lg">{selectedOrder.amount}</p>
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="status">Update Status</Label>
                        <Select
                            value={currentStatus}
                            onValueChange={(value: OrderStatus) => setCurrentStatus(value)}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map(option => (
                                     <SelectItem key={option.value} value={option.value}>
                                        <div className="flex items-center gap-2">
                                            <option.icon className="h-4 w-4" />
                                            {option.label}
                                        </div>
                                     </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     {currentStatus === 'Cancelled' && (
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Cancellation</Label>
                            <Textarea
                                id="reason"
                                placeholder="Explain why the order was cancelled..."
                                value={cancellationReason}
                                onChange={(e) => setCancellationReason(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}
