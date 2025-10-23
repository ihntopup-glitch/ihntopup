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
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import type { PaymentMethod } from '@/lib/data';
import { collection, query, doc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PaymentMethodFormValues = {
  name: string;
  accountNumber: string;
  accountType: 'Personal' | 'Agent';
  instructions?: string;
  imageUrl: string;
};

export default function PaymentMethodsPage() {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingMethod, setEditingMethod] = React.useState<PaymentMethod | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const firestore = useFirestore();
    const { toast } = useToast();
    const { register, handleSubmit, reset, setValue, watch, control } = useForm<PaymentMethodFormValues>();

    const methodsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payment_methods')) : null, [firestore]);
    const { data: paymentMethods, isLoading } = useCollection<PaymentMethod>(methodsQuery);

    const handleEdit = (method: PaymentMethod) => {
        setEditingMethod(method);
        reset({
            name: method.name,
            accountNumber: method.accountNumber,
            accountType: method.accountType,
            instructions: method.instructions || '',
            imageUrl: method.image?.src || '',
        });
        setIsDialogOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingMethod(null);
        reset({
            name: '',
            accountNumber: '',
            accountType: 'Personal',
            instructions: '',
            imageUrl: '',
        });
        setIsDialogOpen(true);
    }
    
    const onSubmit = async (data: PaymentMethodFormValues) => {
        if (!firestore) return;
        setIsSubmitting(true);
        
        const docData = {
          ...data,
          image: { src: data.imageUrl, hint: data.name.toLowerCase() }
        }

        try {
            if (editingMethod) {
                const docRef = doc(firestore, 'payment_methods', editingMethod.id);
                updateDocumentNonBlocking(docRef, docData);
                toast({ title: "পেমেন্ট পদ্ধতি আপডেট করা হয়েছে" });
            } else {
                addDocumentNonBlocking(collection(firestore, 'payment_methods'), docData);
                toast({ title: "পেমেন্ট পদ্ধতি যোগ করা হয়েছে" });
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: "অপারেশন ব্যর্থ",
                description: error.message || "পেমেন্ট পদ্ধতি সংরক্ষণ করা যায়নি।",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDelete = (methodId: string) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'payment_methods', methodId);
        deleteDocumentNonBlocking(docRef);
        toast({ variant: 'destructive', title: "পেমেন্ট পদ্ধতি মুছে ফেলা হয়েছে" });
    }

    if (isLoading) {
      return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">পেমেন্ট পদ্ধতি</h1>
          <Button onClick={handleAddNew} className="gap-1">
            <PlusCircle className="h-4 w-4" />
            নতুন পদ্ধতি যোগ করুন
          </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>পেমেন্ট পদ্ধতি ম্যানেজ করুন</CardTitle>
          <CardDescription>
            ব্যবহারকারীদের জন্য উপলব্ধ পেমেন্ট পদ্ধতি যোগ, এডিট বা মুছে ফেলুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">লোগো</TableHead>
                <TableHead>নাম</TableHead>
                <TableHead>অ্যাকাউন্ট নম্বর</TableHead>
                <TableHead>অ্যাকাউন্টের ধরন</TableHead>
                <TableHead>
                  <span className="sr-only">একশন</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods?.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="hidden sm:table-cell">
                    {method.image?.src && (
                        <Image
                        alt={method.name}
                        className="aspect-video rounded-md object-contain"
                        height="40"
                        src={method.image.src}
                        width="80"
                        />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{method.name}</TableCell>
                   <TableCell className="font-mono">{method.accountNumber}</TableCell>
                   <TableCell>
                        <Badge variant={method.accountType === 'Personal' ? 'secondary' : 'outline'}>{method.accountType}</Badge>
                    </TableCell>
                  <TableCell className="text-right">
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
                        <DropdownMenuItem onSelect={() => handleEdit(method)}>এডিট</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(method.id)} className="text-red-500">মুছে ফেলুন</DropdownMenuItem>
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
              <DialogTitle>{editingMethod ? 'পেমেন্ট পদ্ধতি এডিট করুন' : 'নতুন পেমেন্ট পদ্ধতি যোগ করুন'}</DialogTitle>
              <DialogDescription>
                পেমেন্ট পদ্ধতির জন্য বিস্তারিত তথ্য পূরণ করুন।
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">পদ্ধতির নাম</Label>
                <Input id="name" {...register('name', { required: true })} placeholder="যেমন, bKash" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">অ্যাকাউন্ট নম্বর</Label>
                <Input id="accountNumber" {...register('accountNumber', { required: true })} placeholder="01xxxxxxxxx" />
              </div>
               <div className="space-y-2">
                <Label htmlFor="accountType">অ্যাকাউন্টের ধরন</Label>
                 <Select onValueChange={(value) => setValue('accountType', value as any)} value={watch('accountType')}>
                    <SelectTrigger>
                        <SelectValue placeholder="ধরন নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Personal">পার্সোনাল</SelectItem>
                        <SelectItem value="Agent">এজেন্ট</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">নির্দেশাবলী (ঐচ্ছিক)</Label>
                <Textarea id="instructions" {...register('instructions')} placeholder="যেমন, 'Send Money' অপশন ব্যবহার করুন।" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">লোগো URL</Label>
                <Input id="imageUrl" {...register('imageUrl')} placeholder="https://example.com/logo.png" />
              </div>
            <DialogFooter className="!mt-6">
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
    