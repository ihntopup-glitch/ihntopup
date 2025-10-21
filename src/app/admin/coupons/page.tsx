'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  Loader2,
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { Coupon } from '@/lib/data';
import { collection, query, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type CouponFormValues = {
  code: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  usageLimitPerUser: number;
  isActive: boolean;
  minPurchaseAmount: number;
  expiryDate: string;
};

export default function CouponsPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingCoupon, setEditingCoupon] = React.useState<Coupon | null>(null);

    const firestore = useFirestore();
    const { toast } = useToast();
    const couponsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'coupons')) : null, [firestore]);
    const { data: coupons, isLoading } = useCollection<Coupon>(couponsQuery);
    
    const { register, handleSubmit, setValue, reset, watch } = useForm<CouponFormValues>();

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        reset({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            usageLimitPerUser: coupon.usageLimitPerUser || 1,
            isActive: true, // simplified
            minPurchaseAmount: coupon.minPurchaseAmount || 0,
            expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : ''
        });
        setIsDialogOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingCoupon(null);
        reset();
        setIsDialogOpen(true);
    }
    
    const onSubmit = (data: CouponFormValues) => {
        if (!firestore) return;
        
        const docData = { ...data, expiryDate: new Date(data.expiryDate).toISOString() };

        if (editingCoupon) {
            const docRef = doc(firestore, 'coupons', editingCoupon.id);
            updateDocumentNonBlocking(docRef, docData);
            toast({ title: 'Coupon updated successfully!' });
        } else {
            const collectionRef = collection(firestore, 'coupons');
            addDocumentNonBlocking(collectionRef, docData);
            toast({ title: 'Coupon added successfully!' });
        }

        setIsDialogOpen(false);
    }
    
    const handleDelete = (couponId: string) => {
      if (!firestore) return;
      deleteDocumentNonBlocking(doc(firestore, 'coupons', couponId));
      toast({ variant: 'destructive', title: 'Coupon Deleted' });
    }

    const getStatus = (coupon: Coupon) => {
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return 'Expired';
        }
        return 'Active';
    };

    const getStatusBadgeVariant = (status: string) => {
        if (status === 'Active') return 'bg-green-100 text-green-800';
        if (status === 'Expired') return 'bg-gray-100 text-gray-800';
        return 'bg-yellow-100 text-yellow-800';
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }


  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Coupons</h1>
          <Button onClick={handleAddNew} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Coupon
          </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Coupons</CardTitle>
          <CardDescription>
            Add, edit, or delete discount coupons.
          </CardDescription>
           <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search coupons..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Value</TableHead>
                 <TableHead className="hidden sm:table-cell">Usage Limit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons?.map((coupon) => {
                const status = getStatus(coupon);
                return (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                   <TableCell className="hidden md:table-cell">{coupon.type}</TableCell>
                   <TableCell className="hidden md:table-cell">{coupon.type === 'Percentage' ? `${coupon.value}%` : `৳${coupon.value}`}</TableCell>
                   <TableCell className="hidden sm:table-cell">{coupon.usageLimitPerUser}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeVariant(status)}>
                      {status}
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
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEdit(coupon)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(coupon.id)} className="text-red-500">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
              <DialogDescription>
                {editingCoupon ? `Update details for ${editingCoupon.code}.` : 'Fill in the details for the new coupon.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Coupon Code</Label>
                <Input id="code" {...register('code', { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                     <Select onValueChange={(value) => setValue('type', value as any)} value={watch('type')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Percentage">Percentage</SelectItem>
                            <SelectItem value="Fixed">Fixed Amount</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input id="value" type="number" {...register('value', { required: true, valueAsNumber: true })} />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="minPurchaseAmount">Min. Purchase (৳)</Label>
                    <Input id="minPurchaseAmount" type="number" {...register('minPurchaseAmount', { valueAsNumber: true })} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="usageLimitPerUser">Usage Limit</Label>
                    <Input id="usageLimitPerUser" type="number" {...register('usageLimitPerUser', { valueAsNumber: true })} />
                  </div>
              </div>
               <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input id="expiryDate" type="date" {...register('expiryDate')} />
                </div>
              <div className="flex items-center space-x-2">
                <Switch id="status-mode" {...register('isActive')} />
                <Label htmlFor="status-mode">Active</Label>
              </div>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </>
  );
}
