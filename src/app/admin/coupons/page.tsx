
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, 'Coupon code is required.'),
  type: z.enum(['Percentage', 'Fixed Amount']),
  value: z.coerce.number().min(0, 'Value must be positive.'),
  minPurchaseAmount: z.coerce.number().min(0, 'Minimum purchase must be positive.'),
  expiryDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  usageLimitPerUser: z.coerce.number().int().min(0, 'Usage limit must be a non-negative integer.'),
  pointsRequired: z.coerce.number().int().min(0, 'Points must be a non-negative integer.'),
  isActive: z.boolean(),
});

type CouponFormValues = z.infer<typeof couponSchema>;

const mockCoupons: CouponFormValues[] = [
    { id: '1', code: 'SUMMER10', type: 'Percentage', value: 10, minPurchaseAmount: 500, expiryDate: '2024-12-31', usageLimitPerUser: 1, pointsRequired: 100, isActive: true },
    { id: '2', code: 'NEW50', type: 'Fixed Amount', value: 50, minPurchaseAmount: 200, expiryDate: '2024-11-30', usageLimitPerUser: 1, pointsRequired: 0, isActive: true },
    { id: '3', code: 'INACTIVE20', type: 'Percentage', value: 20, minPurchaseAmount: 1000, expiryDate: '2025-01-01', usageLimitPerUser: 5, pointsRequired: 500, isActive: false },
];


export default function CouponsPage() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState(mockCoupons);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponFormValues | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      type: 'Fixed Amount',
      value: 0,
      minPurchaseAmount: 0,
      expiryDate: '',
      usageLimitPerUser: 1,
      pointsRequired: 0,
      isActive: true,
    },
  });

  const openDialogForEdit = (coupon: CouponFormValues) => {
    setEditingCoupon(coupon);
    reset(coupon);
    setIsDialogOpen(true);
  };
  
  const openDialogForNew = () => {
    setEditingCoupon(null);
    reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: CouponFormValues) => {
    if (editingCoupon) {
        // Update logic
        setCoupons(coupons.map(c => c.id === editingCoupon.id ? { ...data, id: c.id } : c));
        toast({ title: "Coupon Updated", description: `Coupon "${data.code}" has been updated.` });
    } else {
        // Add new logic
        setCoupons([...coupons, { ...data, id: String(Date.now()) }]);
        toast({ title: "Coupon Created", description: `New coupon "${data.code}" has been added.` });
    }
    setIsDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleDelete = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
    toast({ title: "Coupon Deleted", description: `Coupon has been deleted.` });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Coupons</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialogForNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
                <DialogDescription>
                  Fill in the details for the coupon. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input id="code" {...register('code')} />
                  {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Discount Type</Label>
                     <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Percentage">Percentage</SelectItem>
                                <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="value">Discount Value</Label>
                  <Input id="value" type="number" {...register('value')} />
                  {errors.value && <p className="text-red-500 text-sm">{errors.value.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minPurchaseAmount">Minimum Purchase Amount</Label>
                  <Input id="minPurchaseAmount" type="number" {...register('minPurchaseAmount')} />
                  {errors.minPurchaseAmount && <p className="text-red-500 text-sm">{errors.minPurchaseAmount.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" type="date" {...register('expiryDate')} />
                   {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="usageLimitPerUser">Usage Limit Per User</Label>
                  <Input id="usageLimitPerUser" type="number" {...register('usageLimitPerUser')} />
                  {errors.usageLimitPerUser && <p className="text-red-500 text-sm">{errors.usageLimitPerUser.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pointsRequired">Points to Redeem</Label>
                  <Input id="pointsRequired" type="number" {...register('pointsRequired')} />
                   {errors.pointsRequired && <p className="text-red-500 text-sm">{errors.pointsRequired.message}</p>}
                </div>
                
                <div className="flex items-center space-x-2 pt-6">
                    <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                id="isActive"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor="isActive">Show in Coupon Store</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Coupon</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Usage Limit</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-medium">{coupon.code}</TableCell>
                <TableCell>{coupon.type}</TableCell>
                <TableCell>{coupon.type === 'Percentage' ? `${coupon.value}%` : `৳${coupon.value}`}</TableCell>
                <TableCell>{new Date(coupon.expiryDate).toLocaleDateString()}</TableCell>
                <TableCell>{coupon.usageLimitPerUser}</TableCell>
                <TableCell>{coupon.pointsRequired}</TableCell>
                <TableCell>
                  <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openDialogForEdit(coupon)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                     <Button variant="destructive" size="icon" onClick={() => coupon.id && handleDelete(coupon.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
