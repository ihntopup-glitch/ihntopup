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
import { useForm, Controller } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { Notice } from '@/lib/data';


type NoticeFormValues = {
  title: string;
  content: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  status: boolean;
  imageUrl?: string;
};

export default function NoticesPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingNotice, setEditingNotice] = React.useState<Notice | null>(null);

    const firestore = useFirestore();
    const { toast } = useToast();
    const noticesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'notices')) : null, [firestore]);
    const { data: notices, isLoading } = useCollection<Notice>(noticesQuery);

    const { register, handleSubmit, reset, setValue, watch, control } = useForm<NoticeFormValues>();

    const handleEdit = (notice: Notice) => {
        setEditingNotice(notice);
        reset({
            title: notice.title,
            content: notice.content,
            type: notice.type,
            status: notice.status === 'Active',
            imageUrl: notice.image?.src || '',
        });
        setIsDialogOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingNotice(null);
        reset({ title: '', content: '', status: true, type: 'Info', imageUrl: '' });
        setIsDialogOpen(true);
    }
    
    const onSubmit = (data: NoticeFormValues) => {
        if (!firestore) return;
        const docData = {
          title: data.title,
          content: data.content,
          type: data.type,
          status: data.status ? 'Active' : 'Inactive',
          image: data.imageUrl ? { src: data.imageUrl, hint: "notice image" } : null,
        };

        if (editingNotice) {
            updateDocumentNonBlocking(doc(firestore, 'notices', editingNotice.id), docData);
            toast({ title: 'নোটিশ সফলভাবে আপডেট করা হয়েছে' });
        } else {
            addDocumentNonBlocking(collection(firestore, 'notices'), docData);
            toast({ title: 'নোটিশ সফলভাবে যোগ করা হয়েছে' });
        }
        setIsDialogOpen(false);
    }

    const handleDelete = (noticeId: string) => {
        if (!firestore) return;
        deleteDocumentNonBlocking(doc(firestore, 'notices', noticeId));
        toast({ variant: 'destructive', title: 'নোটিশ মুছে ফেলা হয়েছে' });
    }

    const getStatusBadgeVariant = (status: Notice['status']) => {
        return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    };
    
    const getTypeBadgeVariant = (type: Notice['type']) => {
        switch(type){
            case 'Info': return 'bg-blue-100 text-blue-800';
            case 'Success': return 'bg-green-100 text-green-800';
            case 'Warning': return 'bg-yellow-100 text-yellow-800';
            case 'Error': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
      return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }


  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">নোটিশসমূহ</h1>
          <Button onClick={handleAddNew} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            নতুন নোটিশ যোগ করুন
          </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>নোটিশ ম্যানেজ করুন</CardTitle>
          <CardDescription>
            সাইট-জুড়ে নোটিশ তৈরি, এডিট বা মুছে ফেলুন।
          </CardDescription>
           <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="নোটিশ খুঁজুন..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>শিরোনাম</TableHead>
                <TableHead className="hidden sm:table-cell">ধরন</TableHead>
                <TableHead className="hidden md:table-cell">বিষয়বস্তু</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>
                  <span className="sr-only">একশন</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices?.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell className="font-medium">{notice.title}</TableCell>
                   <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className={getTypeBadgeVariant(notice.type)}>{notice.type}</Badge>
                    </TableCell>
                   <TableCell className="hidden md:table-cell max-w-xs truncate">{notice.content}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeVariant(notice.status)}>
                      {notice.status === 'Active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
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
                        <DropdownMenuItem onSelect={() => handleEdit(notice)}>এডিট</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(notice.id)} className="text-red-500">মুছে ফেলুন</DropdownMenuItem>
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
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingNotice ? 'নোটিশ এডিট করুন' : 'নতুন নোটিশ যোগ করুন'}</DialogTitle>
              <DialogDescription>
                নোটিশের জন্য বিস্তারিত তথ্য পূরণ করুন।
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">শিরোনাম</Label>
                    <Input id="title" {...register('title', { required: true })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="content">বিষয়বস্তু</Label>
                    <Textarea id="content" {...register('content', { required: true })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="imageUrl">ছবির URL (ঐচ্ছিক)</Label>
                    <Input id="imageUrl" {...register('imageUrl')} placeholder="https://example.com/image.png" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">নোটিশের ধরন</Label>
                    <Select onValueChange={(v) => setValue('type', v as any)} value={watch('type')}>
                        <SelectTrigger>
                            <SelectValue placeholder="একটি ধরন নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Info">তথ্য</SelectItem>
                            <SelectItem value="Success">সফল</SelectItem>
                            <SelectItem value="Warning">সতর্কতা</SelectItem>
                            <SelectItem value="Error">ত্রুটি</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                id="status"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor="status">সক্রিয়</Label>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>বাতিল</Button>
                    <Button type="submit">সংরক্ষণ</Button>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </>
  );
}
