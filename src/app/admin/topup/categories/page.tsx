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
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { TopUpCategory } from '@/lib/data';
import { collection, query, doc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';


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
        
        try {
            if (editingCategory) {
                const docRef = doc(firestore, 'categories', editingCategory.id);
                updateDocumentNonBlocking(docRef, data);
                toast({ title: "ক্যাটাগরি আপডেট করা হয়েছে", description: `${data.name} আপডেট করা হয়েছে।` });
            } else {
                addDocumentNonBlocking(collection(firestore, 'categories'), data);
                toast({ title: "ক্যাটাগরি যোগ করা হয়েছে", description: `${data.name} যোগ করা হয়েছে।` });
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error("Failed to save category:", error);
            toast({
                variant: 'destructive',
                title: "অপারেশন ব্যর্থ",
                description: error.message || "ক্যাটাগরি সংরক্ষণ করা যায়নি। অনুমতি পরীক্ষা করুন অথবা আবার চেষ্টা করুন।",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDelete = (categoryId: string) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'categories', categoryId);
        deleteDocumentNonBlocking(docRef);
        toast({ variant: 'destructive', title: "ক্যাটাগরি মুছে ফেলা হয়েছে" });
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
          <h1 className="text-2xl font-bold">টপ-আপ ক্যাটাগরি</h1>
          <Button onClick={handleAddNew} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            নতুন ক্যাটাগরি যোগ করুন
          </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ক্যাটাগরি ম্যানেজ করুন</CardTitle>
          <CardDescription>
            টপ-আপ ক্যাটাগরি যোগ, এডিট বা মুছে ফেলুন।
          </CardDescription>
           <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="ক্যাটাগরি খুঁজুন..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">ছবি</span>
                </TableHead>
                <TableHead>নাম</TableHead>
                <TableHead className="hidden md:table-cell">বিবরণ</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>
                  <span className="sr-only">একশন</span>
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
                      {category.status === 'Active' ? 'সক্রিয়' : 'খসড়া'}
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
                        <DropdownMenuItem onSelect={() => handleEdit(category)}>এডিট</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(category.id)} className="text-red-500">মুছে ফেলুন</DropdownMenuItem>
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
              <DialogTitle>{editingCategory ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি যোগ করুন'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? `${editingCategory.name}-এর জন্য বিস্তারিত আপডেট করুন।` : 'নতুন ক্যাটাগরির জন্য বিস্তারিত তথ্য পূরণ করুন।'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">ক্যাটাগরির নাম</Label>
                <Input id="name" {...register('name', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">বিবরণ</Label>
                <Textarea id="description" {...register('description')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-url">ছবির URL</Label>
                <Input id="image-url" {...register('imageUrl')} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                    id="status-mode" 
                    checked={watch('status') === 'Active'}
                    onCheckedChange={(checked) => setValue('status', checked ? 'Active' : 'Draft')}
                />
                <Label htmlFor="status-mode">সক্রিয়</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                সংরক্ষণ
              </Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </>
  );
}
