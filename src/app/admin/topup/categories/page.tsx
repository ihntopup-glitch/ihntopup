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
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { TopUpCategory } from '@/lib/data';
import { collection, query, doc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { createCategory } from '@/ai/flows/create-category';


type CategoryFormValues = {
  name: string;
  description: string;
  imageUrl: string;
  status: 'Active' | 'Draft';
};

export default function CategoriesPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<TopUpCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const firestore = useFirestore();
    const { toast } = useToast();
    const { register, handleSubmit, reset, setValue, watch } = useForm<CategoryFormValues>();

    const categoriesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'categories')) : null, [firestore]);
    const { data: categories, isLoading } = useCollection<TopUpCategory>(categoriesQuery);

    const handleEdit = (category: TopUpCategory) => {
        setEditingCategory(category);
        reset({
            name: category.name,
            description: category.description || '',
            imageUrl: category.imageUrl || '',
            status: category.status as 'Active' | 'Draft' || 'Draft'
        });
        setIsDialogOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingCategory(null);
        reset({
            name: '',
            description: '',
            imageUrl: '',
            status: 'Draft'
        });
        setIsDialogOpen(true);
    }
    
    const onSubmit = async (data: CategoryFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);

        const docData = {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          status: data.status
        };

        try {
            if (editingCategory) {
                const docRef = doc(firestore, 'categories', editingCategory.id);
                updateDocumentNonBlocking(docRef, docData);
                toast({ title: "Category Updated", description: `${data.name} has been updated.` });
            } else {
                await createCategory(docData);
                toast({ title: "Category Added", description: `${data.name} has been added.` });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to save category:", error);
            toast({
                variant: 'destructive',
                title: "Operation Failed",
                description: "Could not save the category. Please check permissions or try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDelete = (categoryId: string) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'categories', categoryId);
        deleteDocumentNonBlocking(docRef);
        toast({ variant: 'destructive', title: "Category Deleted" });
    }

    const getStatusBadgeVariant = (status: TopUpCategory['status']) => {
        return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    };

    if (isLoading) {
      return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Top-Up Categories</h1>
          <Button onClick={handleAddNew} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Category
          </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>
            Add, edit, or delete top-up categories.
          </CardDescription>
           <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search categories..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="hidden sm:table-cell">
                    {category.imageUrl && (
                        <Image
                        alt={category.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={category.imageUrl}
                        width="64"
                        />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                   <TableCell className="hidden md:table-cell">{category.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeVariant(category.status)}>
                      {category.status}
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
                        <DropdownMenuItem onSelect={() => handleEdit(category)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(category.id)} className="text-red-500">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? `Update the details for ${editingCategory.name}.` : 'Fill in the details for the new category.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" {...register('name', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input id="image-url" {...register('imageUrl')} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                    id="status-mode" 
                    checked={watch('status') === 'Active'}
                    onCheckedChange={(checked) => setValue('status', checked ? 'Active' : 'Draft')}
                />
                <Label htmlFor="status-mode">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </>
  );
}
