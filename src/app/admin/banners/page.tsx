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
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { BannerData } from '@/lib/data';
import { collection, query, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


type BannerFormValues = {
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
};

export default function BannersPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingBanner, setEditingBanner] = React.useState<BannerData | null>(null);

    const firestore = useFirestore();
    const { toast } = useToast();
    const bannersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'banners')) : null, [firestore]);
    const { data: banners, isLoading } = useCollection<BannerData>(bannersQuery);

    const { register, handleSubmit, reset, setValue, watch } = useForm<BannerFormValues>();

    const handleEdit = (banner: BannerData) => {
        setEditingBanner(banner);
        reset({
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl,
            isActive: banner.isActive,
            startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
            endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
        });
        setIsDialogOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingBanner(null);
        reset();
        setIsDialogOpen(true);
    }
    
    const onSubmit = (data: BannerFormValues) => {
        if (!firestore) return;

        const docData = {
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        };

        if (editingBanner) {
            updateDocumentNonBlocking(doc(firestore, 'banners', editingBanner.id), docData);
            toast({ title: "Banner Updated" });
        } else {
            addDocumentNonBlocking(collection(firestore, 'banners'), docData);
            toast({ title: "Banner Added" });
        }
        setIsDialogOpen(false);
    }
    
    const handleDelete = (bannerId: string) => {
        if (!firestore) return;
        deleteDocumentNonBlocking(doc(firestore, 'banners', bannerId));
        toast({ variant: 'destructive', title: "Banner Deleted" });
    }

    const getStatusBadgeVariant = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Banners</h1>
          <Button onClick={handleAddNew} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Banner
          </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Banners</CardTitle>
          <CardDescription>
            Add, edit, or delete promotional banners.
          </CardDescription>
           <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search banners..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[150px] sm:table-cell">
                  Preview
                </TableHead>
                <TableHead>Link URL</TableHead>
                <TableHead className="hidden md:table-cell">Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners?.map((banner) => (
                <TableRow key={banner.id}>
                   <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={banner.alt || 'Banner image'}
                      className="aspect-video rounded-md object-cover"
                      height="64"
                      src={banner.imageUrl}
                      width="128"
                    />
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-xs">{banner.linkUrl}</TableCell>
                   <TableCell className="hidden md:table-cell">{new Date(banner.startDate).toLocaleDateString()} to {new Date(banner.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeVariant(banner.isActive)}>
                      {banner.isActive ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onSelect={() => handleEdit(banner)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(banner.id)} className="text-red-500">Delete</DropdownMenuItem>
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
              <DialogDescription>
                Fill in the details for the banner.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" {...register('imageUrl', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkUrl">Link URL</Label>
                <Input id="linkUrl" {...register('linkUrl', { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" {...register('startDate')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" {...register('endDate')} />
                  </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="status" {...register('isActive')} />
                <Label htmlFor="status">Active</Label>
              </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </>
  );
}
