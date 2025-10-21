'use client';

import * as React from 'react';
import {
  File,
  ListFilter,
  Search,
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

const transactions = [
    {
        transactionId: 'TRN001',
        orderId: 'ORD001',
        user: 'Liam Johnson',
        product: 'Free Fire 1080 Diamonds',
        amount: '৳100.00',
        status: 'Fulfilled',
        paymentMethod: 'Wallet',
        date: '2023-06-23',
    },
    {
        transactionId: 'TRN002',
        orderId: 'ORD002',
        user: 'Olivia Smith',
        product: 'PUBG 600 UC',
        amount: '৳150.00',
        status: 'Pending',
        paymentMethod: 'bKash',
        date: '2023-06-24',
    },
    {
        transactionId: 'TRN003',
        orderId: 'ORD003',
        user: 'Noah Williams',
        product: 'Netflix 1 Month',
        amount: '৳350.00',
        status: 'Cancelled',
        paymentMethod: 'Nagad',
        date: '2023-06-25',
    },
];

type Transaction = (typeof transactions)[0];

const getStatusBadgeVariant = (status: Transaction['status']) => {
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


export default function OrderTransactionsPage() {
  return (
    <>
      <Tabs defaultValue="all">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl font-bold">Order Transactions</h1>
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
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Fulfilled</DropdownMenuCheckboxItem>
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
        <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                A log of all order-related financial transactions.
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions..." className="pl-8 w-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[120px]'>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.transactionId}>
                      <TableCell className='font-mono'>{tx.orderId}</TableCell>
                      <TableCell>{tx.user}</TableCell>
                      <TableCell>{tx.product}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeVariant(tx.status)} variant="outline">
                          {tx.status}
                        </Badge>
                      </TableCell>
                       <TableCell>{tx.paymentMethod}</TableCell>
                       <TableCell className="text-right font-medium">{tx.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </Tabs>
    </>
  );
}
