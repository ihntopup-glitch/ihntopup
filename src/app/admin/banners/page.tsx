'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
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

const banners = [
    {
        id: 'bnr001',
        imageUrl: 'https://picsum.photos/seed/banneradmin1/128/64',
        linkUrl: '/topup/freefire',
        status: 'Active',
        startDate: '2024-07-01',
        endDate: '2024-07-31',
    },
    {
        id: 'bnr002',
        imageUrl: 'https://picsum.photos/seed/banneradmin2/128/64',
        linkUrl: '/special-offer',
        status: 'Inactive',
        startDate: '2024-06-01',
        endDate: '2024-06-30',
    }
];

type Banner = (typeof banners)[0];

type BannerFormValues = {
  imageUrl: string;
  linkUrl: string;
  status: boolean;
  startDate: string;
  endDate: string;
};

export default function BannersPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null);

    const { register, handleSubmit, reset } = useForm<BannerFormValues>();

    const handleEdit = (banner: Banner) => {
        setEditingBanner(banner);
        reset({
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl,
            status: banner.status === 'Active',
            startDate: banner.startDate,
            endDate: banner.endDate
        });
        setIsDialogOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingBanner(null);
        reset();
        setIsDialogOpen(true);
    }
    
    const onSubmit = (data: BannerFormValues) => {
        console.log(data);
        setIsDialogOpen(false);
    }

    const getStatusBadgeVariant = (status: Banner['status']) => {
        return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    };

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
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                   <TableCell className="hidden sm:table-cell">
                    <Image
                      alt="Banner preview"
                      className="aspect-video rounded-md object-cover"
                      height="64"
                      src={banner.imageUrl}
                      width="128"
                    />
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-xs">{banner.linkUrl}</TableCell>
                   <TableCell className="hidden md:table-cell">{banner.startDate} to {banner.endDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeVariant(banner.status)}>
                      {banner.status}
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
                        <DropdownMenuItem>Delete</DropdownMenuItem>
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
                <Switch id="status" {...register('status')} />
                <Label htmlFor="status">Active</Label>
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
