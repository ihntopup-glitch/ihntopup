
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Settings, MoreHorizontal, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const orders = [
  {
    playerId: '4189549439',
    password: 'IDCODE',
    packageName: '10 Tk Weekly Offer',
    price: 10,
    status: 'Pending',
    createdAt: '2025-10-18 11:24 PM',
  },
  {
    playerId: '8334149307',
    password: 'IDCODE',
    packageName: '10 Tk Weekly Offer',
    price: 10,
    status: 'Pending',
    createdAt: '2025-10-18 11:24 PM',
  },
  {
    playerId: '5746532757',
    password: 'IDCODE',
    packageName: '10 Tk Weekly Offer',
    price: 10,
    status: 'Completed',
    createdAt: '2025-10-18 11:24 PM',
  },
  {
    playerId: '9528092516',
    password: 'IDCODE',
    packageName: '10 Tk Weekly Offer',
    price: 10,
    status: 'Pending',
    createdAt: '2025-10-18 11:24 PM',
  },
  {
    playerId: '9457819356',
    password: 'IDCODE',
    packageName: '10 Tk Weekly Offer',
    price: 10,
    status: 'Cancelled',
    createdAt: '2025-10-18 11:24 PM',
  },
  {
    playerId: '2680026232',
    password: 'IDCODE',
    packageName: '10 Tk Weekly Offer',
    price: 10,
    status: 'Pending',
    createdAt: '2025-10-18 11:24 PM',
  },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Pending':
      return 'secondary';
    case 'Completed':
      return 'default';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Admins Order</h1>
        <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by Player ID..." className="pl-9" />
            </div>
            <Button>Search</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player id</TableHead>
              <TableHead className="hidden md:table-cell">Package name</TableHead>
              <TableHead className="hidden sm:table-cell">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{order.playerId}</TableCell>
                <TableCell className="hidden md:table-cell">{order.packageName}</TableCell>
                <TableCell className="hidden sm:table-cell">৳{order.price}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem>View Details</DropdownMenuItem>
                       <DropdownMenuItem>Edit</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
