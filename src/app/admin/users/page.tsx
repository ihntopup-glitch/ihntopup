
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
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userProfile, orders } from '@/lib/data'; // Mock data

const mockUsers = [
  { ...userProfile, id: 'user1', walletBalance: 125.50, orders: orders.length, status: 'Active' as const, isVerified: true, photoURL: 'https://github.com/shadcn.png' },
  { id: 'user2', name: 'Jane Smith', email: 'jane@example.com', walletBalance: 75.00, orders: 2, status: 'Active' as const, isVerified: true, photoURL: '' },
  { id: 'user3', name: 'Mike Johnson', email: 'mike@example.com', walletBalance: 0, orders: 0, status: 'Banned' as const, isVerified: false, photoURL: 'https://github.com/vercel.png'  },
  { id: 'user4', name: 'Rahi Mondol', email: 'rahimondol990@gmail.com', walletBalance: 500, orders: 10, status: 'Active' as const, isVerified: false, photoURL: ''  },
];


export default function UsersPage() {
    const searchParams = useSearchParams();
    const filter = searchParams.get('filter') || 'all'; // 'all' or 'verified'

    const filteredUsers = mockUsers.filter(user => {
        if (filter === 'verified') {
            return user.isVerified;
        }
        return true;
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <div className="flex items-center gap-2">
            <Input placeholder="Search by name or email..." className="w-64" />
             <Button>Search</Button>
        </div>
      </div>
        
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Wallet Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                    <div className='flex items-center gap-3'>
                        <Avatar>
                            <AvatarImage src={user.photoURL} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium hidden sm:inline">{user.name}</span>
                    </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell className="hidden lg:table-cell">৳{user.walletBalance?.toFixed(2)}</TableCell>
                <TableCell>
                   <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-green-600 focus:text-green-700">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Verify User
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-700">
                        <UserX className="mr-2 h-4 w-4" />
                        Ban User
                      </DropdownMenuItem>
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
