'use client';

import * as React from 'react';
import {
  ChevronDown,
  MoreHorizontal,
  PlusCircle,
  File,
  ListFilter,
  Search,
  Loader2
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import type { User as UserData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = React.useState<UserData | null>(null);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [walletBalance, setWalletBalance] = React.useState<number | string>('');
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const { data: users, isLoading } = useCollection<UserData>(usersQuery);
  const { toast } = useToast();

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setWalletBalance(user.walletBalance ?? 0);
  };
  
  const handleSaveChanges = () => {
    if (!selectedUser || !firestore) return;
    const userRef = doc(firestore, 'users', selectedUser.id);
    
    const balanceAsNumber = Number(walletBalance);
    if(isNaN(balanceAsNumber)) {
      toast({ variant: 'destructive', title: "অবৈধ ব্যালেন্স", description: "ওয়ালেট ব্যালেন্স অবশ্যই একটি সংখ্যা হতে হবে।"});
      return;
    }

    updateDocumentNonBlocking(userRef, { name, email, walletBalance: balanceAsNumber });
    toast({ title: "ব্যবহারকারী আপডেট করা হয়েছে", description: `${name}-এর প্রোফাইল আপডেট করা হয়েছে।`});
    setSelectedUser(null);
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteAlertOpen(true);
  };
  
  const confirmDelete = () => {
      // In a real app, you'd probably soft delete or have a confirmation
      if (!userToDelete) return;
      console.log("Deleting user", userToDelete);
      toast({ variant: 'destructive', title: "ব্যবহারকারী মুছে ফেলা হয়েছে", description: `ব্যবহারকারী আইডি ${userToDelete} মুছে ফেলা হয়েছে।`});
      setUserToDelete(null);
      setIsDeleteAlertOpen(false);
  }

  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    if (!searchTerm) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

  return (
    <>
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">সব</TabsTrigger>
            <TabsTrigger value="verified">ভেরিফাইড</TabsTrigger>
            <TabsTrigger value="unverified">আনভেরিফাইড</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    ফিল্টার
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>ফিল্টার করুন</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  ভেরিফাইড
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>আনভেরিফাইড</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                এক্সপোর্ট
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>ব্যবহারকারীগণ</CardTitle>
              <CardDescription>
                আপনার ব্যবহারকারীদের ম্যানেজ করুন এবং তাদের বিস্তারিত দেখুন।
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ব্যবহারকারী</TableHead>
                    <TableHead className="hidden md:table-cell">
                      ওয়ালেট
                    </TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>
                      <span className="sr-only">একশন</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.photoURL || ''} alt={user.name} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        ৳{user.walletBalance?.toFixed(2) ?? '0.00'}
                      </TableCell>
                      <TableCell>
                        <Badge
                           className={user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                        >
                          {user.isVerified ? 'ভেরিফাইড' : 'আনভেরিফাইড'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">মেনু</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>একশন</DropdownMenuLabel>
                            <DropdownMenuItem
                              onSelect={() => handleEdit(user)}
                            >
                              এডিট
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(user.id)} className="text-red-500">মুছে ফেলুন</DropdownMenuItem>
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
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ব্যবহারকারী এডিট করুন</DialogTitle>
              <DialogDescription>
                {selectedUser.name}-এর প্রোফাইলে পরিবর্তন করুন।
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  নাম
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  ইমেইল
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="walletBalance" className="text-right">
                  ওয়ালেট (৳)
                </Label>
                <Input
                  id="walletBalance"
                  type="number"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedUser(null)}>বাতিল</Button>
              <Button type="submit" onClick={handleSaveChanges}>পরিবর্তন সংরক্ষণ করুন</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this user.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
