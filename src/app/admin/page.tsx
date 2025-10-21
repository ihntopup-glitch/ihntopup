
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
import { Settings, MoreHorizontal } from 'lucide-react';
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
    status: 'Pending',
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
    status: 'Pending',
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

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Admins Order</h1>
      <p className="text-gray-500 mb-6">Total result: 709</p>

      <div className="flex items-center gap-4 mb-6">
        <Input placeholder="User id" className="max-w-xs" />
        <Input placeholder="Order id" className="max-w-xs" />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-700">
            <TableRow>
              <TableHead className="w-[50px] hidden md:table-cell">
                <Checkbox />
              </TableHead>
              <TableHead>Player id</TableHead>
              <TableHead className="hidden md:table-cell">Package name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Created at</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={index}>
                <TableCell className="hidden md:table-cell">
                  <Checkbox />
                </TableCell>
                <TableCell>{order.playerId}</TableCell>
                <TableCell className="hidden md:table-cell">{order.packageName}</TableCell>
                <TableCell>{order.price}</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'Pending' ? 'secondary' : 'default'}>{order.status}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{order.createdAt}</TableCell>
                <TableCell>
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
