
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
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { banners as mockBanners } from '@/lib/data'; // Using mock data for now
import type { BannerData } from '@/lib/data';

const bannerSchema = z.object({
  id: z.string().optional(),
  imageUrl: z.string().url('Please enter a valid image URL.'),
  linkUrl: z.string().url('Please enter a valid link URL.'),
  alt: z.string().min(1, 'Alt text is required.'),
  isActive: z.boolean(),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

export default function BannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<BannerData[]>(mockBanners.map(b => ({...b, imageUrl: b.image?.src || '', alt: b.alt || ''})));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerData | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      imageUrl: '',
      linkUrl: '',
      alt: '',
      isActive: true,
    },
  });

  const openDialogForEdit = (banner: BannerData) => {
    setEditingBanner(banner);
    reset({ ...banner, imageUrl: banner.image?.src || banner.imageUrl });
    setIsDialogOpen(true);
  };
  
  const openDialogForNew = () => {
    setEditingBanner(null);
    reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: BannerFormValues) => {
     const bannerData = { 
        ...data, 
        image: { src: data.imageUrl, hint: 'promotional banner' }, 
        startDate: new Date().toISOString(), 
        endDate: new Date().toISOString()
    };
    if (editingBanner) {
        setBanners(banners.map(b => b.id === editingBanner.id ? { ...bannerData, id: b.id } : b));
        toast({ title: "Banner Updated", description: "The banner has been successfully updated." });
    } else {
        setBanners([...banners, { ...bannerData, id: String(Date.now()) }]);
        toast({ title: "Banner Created", description: "The new banner has been added." });
    }
    setIsDialogOpen(false);
    setEditingBanner(null);
  };

  const handleDelete = (id: string) => {
    setBanners(banners.filter(b => b.id !== id));
    toast({ title: "Banner Deleted", description: "The banner has been deleted." });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Banners</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialogForNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
                <DialogDescription>
                  Provide the details for the promotional banner.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" placeholder="https://example.com/image.png" {...register('imageUrl')} />
                  {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkUrl">Link URL</Label>
                  <Input id="linkUrl" placeholder="https://example.com/promotion" {...register('linkUrl')} />
                  {errors.linkUrl && <p className="text-red-500 text-sm">{errors.linkUrl.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input id="alt" placeholder="Descriptive text for the image" {...register('alt')} />
                  {errors.alt && <p className="text-red-500 text-sm">{errors.alt.message}</p>}
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
                    <Label htmlFor="isActive">Set as Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Banner</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Link URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.map((banner) => (
              <TableRow key={banner.id}>
                <TableCell>
                  <Image src={banner.image?.src || banner.imageUrl} alt={banner.alt || ''} width={120} height={50} className="rounded-md object-cover" />
                </TableCell>
                <TableCell className="font-mono text-xs">{banner.linkUrl}</TableCell>
                <TableCell>
                  <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openDialogForEdit(banner)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                     <Button variant="destructive" size="icon" onClick={() => banner.id && handleDelete(banner.id)}>
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

