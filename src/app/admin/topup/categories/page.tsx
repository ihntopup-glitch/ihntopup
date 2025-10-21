
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { topUpCategories as mockCategories } from '@/lib/data'; // Using mock data for now
import type { TopUpCategory } from '@/lib/data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Category name is required.'),
  description: z.string().optional(),
  imageUrl: z.string().url('Please enter a valid image URL.').optional().or(z.literal('')),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<TopUpCategory[]>(mockCategories.map(c => ({...c, isActive: true})));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<(TopUpCategory & {isActive?: boolean}) | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      isActive: true,
    },
  });

  const openDialogForEdit = (category: (TopUpCategory & {isActive?: boolean})) => {
    setEditingCategory(category);
    reset(category);
    setIsDialogOpen(true);
  };
  
  const openDialogForNew = () => {
    setEditingCategory(null);
    reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: CategoryFormValues) => {
    if (editingCategory) {
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...data, id: c.id, cards: c.cards } : c));
        toast({ title: "Category Updated", description: `Category "${data.name}" has been updated.` });
    } else {
        setCategories([...categories, { ...data, id: String(Date.now()), cards: [] }]);
        toast({ title: "Category Created", description: `New category "${data.name}" has been added.` });
    }
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast({ title: "Category Deleted", description: "The category has been deleted." });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Top-up Categories</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialogForNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register('description')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" {...register('imageUrl')} />
                </div>
                 <div className="flex items-center space-x-2 pt-2">
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
                    <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Category</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? 'default' : 'secondary'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
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
                       <DropdownMenuItem onClick={() => openDialogForEdit(category)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                       </DropdownMenuItem>
                       <DropdownMenuItem className="text-red-500" onClick={() => category.id && handleDelete(category.id)}>
                         <Trash2 className="mr-2 h-4 w-4" /> Delete
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
