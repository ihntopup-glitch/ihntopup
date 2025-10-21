
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
import { Settings } from 'lucide-react';

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
              <TableHead className="w-[50px]">
                <Checkbox />
              </TableHead>
              <TableHead>Player id</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Package name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Failed Status</TableHead>
              <TableHead>Completed by</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>{order.playerId}</TableCell>
                <TableCell>{order.password}</TableCell>
                <TableCell>{order.packageName}</TableCell>
                <TableCell>{order.price}</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'Pending' ? 'secondary' : 'default'}>{order.status}</Badge>
                </TableCell>
                <TableCell>---</TableCell>
                <TableCell>---</TableCell>
                <TableCell>{order.createdAt}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
