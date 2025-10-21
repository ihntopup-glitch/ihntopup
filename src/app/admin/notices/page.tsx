
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const noticeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required.'),
  content: z.string().min(1, 'Content is required.'),
  type: z.enum(['banner', 'popup']),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  isActive: z.boolean(),
});

type NoticeFormValues = z.infer<typeof noticeSchema>;

const mockNotices: NoticeFormValues[] = [
    { id: '1', title: 'Maintenance Break', content: 'The server will be down for maintenance on Sunday at 2 AM.', type: 'banner', isActive: true },
    { id: '2', title: 'New Game Added!', content: 'Valorant Points are now available in our store.', type: 'popup', imageUrl: 'https://picsum.photos/seed/valorant-popup/400/200', isActive: true },
    { id: '3', title: 'Old Notice', content: 'This is an old inactive notice.', type: 'banner', isActive: false },
];


export default function NoticesPage() {
  const { toast } = useToast();
  const [notices, setNotices] = useState(mockNotices);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeFormValues | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'banner',
      isActive: true,
      imageUrl: '',
    },
  });

  const noticeType = watch('type');

  const openDialogForEdit = (notice: NoticeFormValues) => {
    setEditingNotice(notice);
    reset(notice);
    setIsDialogOpen(true);
  };
  
  const openDialogForNew = () => {
    setEditingNotice(null);
    reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: NoticeFormValues) => {
    if (editingNotice) {
        setNotices(notices.map(n => n.id === editingNotice.id ? { ...data, id: n.id } : n));
        toast({ title: "Notice Updated", description: "The notice has been successfully updated." });
    } else {
        setNotices([...notices, { ...data, id: String(Date.now()) }]);
        toast({ title: "Notice Created", description: "The new notice has been published." });
    }
    setIsDialogOpen(false);
    setEditingNotice(null);
  };

  const handleDelete = (id: string) => {
    setNotices(notices.filter(n => n.id !== id));
    toast({ title: "Notice Deleted", description: "The notice has been deleted." });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Notices</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialogForNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Notice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editingNotice ? 'Edit Notice' : 'Add New Notice'}</DialogTitle>
                <DialogDescription>
                  Create a notice to be displayed on the website.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" {...register('title')} />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" {...register('content')} />
                  {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                </div>
                
                 <div className="space-y-2">
                  <Label>Notice Type</Label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <div className="flex gap-4">
                            <Button type="button" variant={field.value === 'banner' ? 'default': 'outline'} onClick={() => field.onChange('banner')}>Banner</Button>
                            <Button type="button" variant={field.value === 'popup' ? 'default': 'outline'} onClick={() => field.onChange('popup')}>Popup</Button>
                        </div>
                    )}
                  />
                </div>

                {noticeType === 'popup' && (
                     <div className="space-y-2">
                        <Label htmlFor="imageUrl">Popup Image URL (Optional)</Label>
                        <Input id="imageUrl" placeholder="https://example.com/image.png" {...register('imageUrl')} />
                        {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
                    </div>
                )}

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
                <Button type="submit">Save Notice</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices.map((notice) => (
              <TableRow key={notice.id}>
                <TableCell className="font-medium">{notice.title}</TableCell>
                <TableCell className="capitalize">{notice.type}</TableCell>
                <TableCell>
                  <Badge variant={notice.isActive ? 'default' : 'secondary'}>
                    {notice.isActive ? 'Active' : 'Inactive'}
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
                       <DropdownMenuItem onClick={() => openDialogForEdit(notice)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                       </DropdownMenuItem>
                       <DropdownMenuItem className="text-red-500" onClick={() => notice.id && handleDelete(notice.id)}>
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
