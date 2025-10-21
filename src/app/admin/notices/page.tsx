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

type Notice = {
    id: string;
    title: string;
    content: string;
    type: 'Info' | 'Success' | 'Warning' | 'Error';
    status: 'Active' | 'Inactive';
}

type NoticeFormValues = {
  title: string;
  content: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  status: boolean;
};

export default function NoticesPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingNotice, setEditingNotice] = React.useState<Notice | null>(null);

    const firestore = useFirestore();
    const { toast } = useToast();
    const noticesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'notices')) : null, [firestore]);
    const { data: notices, isLoading } = useCollection<Notice>(noticesQuery);

    const { register, handleSubmit, reset, setValue, watch } = useForm<NoticeFormValues>();

    const handleEdit = (notice: Notice) => {
        setEditingNotice(notice);
        reset({
            title: notice.title,
            content: notice.content,
            type: notice.type,
            status: notice.status === 'Active'
        });
        setIsDialogOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingNotice(null);
        reset({ status: true, type: 'Info' });
        setIsDialogOpen(true);
    }
    
    const onSubmit = (data: NoticeFormValues) => {
        if (!firestore) return;
        const docData = {
          ...data,
          status: data.status ? 'Active' : 'Inactive'
        };

        if (editingNotice) {
            updateDocumentNonBlocking(doc(firestore, 'notices', editingNotice.id), docData);
            toast({ title: 'Notice updated successfully' });
        } else {
            addDocumentNonBlocking(collection(firestore, 'notices'), docData);
            toast({ title: 'Notice added successfully' });
        }
        setIsDialogOpen(false);
    }

    const handleDelete = (noticeId: string) => {
        if (!firestore) return;
        deleteDocumentNonBlocking(doc(firestore, 'notices', noticeId));
        toast({ variant: 'destructive', title: 'Notice Deleted' });
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
          <h1 className="text-2xl font-bold">Notices</h1>
          <Button onClick={handleAddNew} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Notice
          </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Notices</CardTitle>
          <CardDescription>
            Create, edit, or delete site-wide notices.
          </CardDescription>
           <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search notices..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
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
                      {notice.status}
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
                        <DropdownMenuItem onSelect={() => handleEdit(notice)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(notice.id)} className="text-red-500">Delete</DropdownMenuItem>
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
              <DialogTitle>{editingNotice ? 'Edit Notice' : 'Add New Notice'}</DialogTitle>
              <DialogDescription>
                Fill in the details for the notice.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" {...register('title', { required: true })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea id="content" {...register('content', { required: true })} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="type">Notice Type</Label>
                    <Select onValueChange={(v) => setValue('type', v as any)} value={watch('type')}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Info">Info</SelectItem>
                            <SelectItem value="Success">Success</SelectItem>
                            <SelectItem value="Warning">Warning</SelectItem>
                            <SelectItem value="Error">Error</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="status" {...register('status')} />
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
