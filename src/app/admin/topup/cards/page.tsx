'use client'

import * as React from 'react'
import { MoreHorizontal, PlusCircle, Search, Trash2, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm, useFieldArray } from 'react-hook-form'
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase'
import type { TopUpCardData, TopUpCategory } from '@/lib/data'
import { collection, query, doc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

type CardFormValues = {
  name: string
  description: string
  imageUrl: string
  categoryId: string;
  isActive: boolean
  price?: number
  options: { name: string; price: number }[]
}

export default function TopupCardsPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingCard, setEditingCard] = React.useState<TopUpCardData | null>(null)
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const cardsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'top_up_cards')) : null, [firestore]);
  const categoriesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'categories')) : null, [firestore]);

  const { data: cards, isLoading: isLoadingCards } = useCollection<TopUpCardData>(cardsQuery);
  const { data: categories, isLoading: isLoadingCategories } = useCollection<TopUpCategory>(categoriesQuery);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CardFormValues>({
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      categoryId: '',
      isActive: true,
      price: undefined,
      options: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  })

  const hasOptions = watch('options').length > 0

  const handleEdit = (card: TopUpCardData) => {
    setEditingCard(card)
    reset({
      name: card.name,
      description: card.description || '',
      imageUrl: card.image?.src || '',
      categoryId: card.categoryId,
      isActive: card.isActive ?? true,
      price: card.price,
      options: card.options || [],
    })
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingCard(null)
    reset({
        name: '',
        description: '',
        imageUrl: '',
        categoryId: '',
        isActive: true,
        price: 0,
        options: [{ name: '', price: 0 }]
    })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: CardFormValues) => {
    if (!firestore) return;
    
    const collectionRef = collection(firestore, 'top_up_cards');
    const docData = {
        name: data.name,
        description: data.description,
        image: { src: data.imageUrl, hint: data.name.toLowerCase().replace(/ /g, '-') },
        categoryId: data.categoryId,
        price: data.options.length > 0 ? (data.options[0].price || 0) : (data.price || 0),
        options: data.options,
        isActive: data.isActive,
    };
    
    if (editingCard) {
        const docRef = doc(firestore, 'top_up_cards', editingCard.id);
        updateDocumentNonBlocking(docRef, docData);
        toast({ title: "কার্ড আপডেট করা হয়েছে", description: `${data.name} আপডেট করা হয়েছে।`});
    } else {
        addDocumentNonBlocking(collectionRef, docData);
        toast({ title: "কার্ড যোগ করা হয়েছে", description: `${data.name} যোগ করা হয়েছে।`});
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (cardId: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'top_up_cards', cardId));
    toast({ variant: 'destructive', title: "কার্ড মুছে ফেলা হয়েছে" });
  }
  
  const getCategoryName = (categoryId: string) => {
      return categories?.find(c => c.id === categoryId)?.name || 'N/A';
  }

  const isLoading = isLoadingCards || isLoadingCategories;

  return (
    <>
       <div className="flex items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold">টপ-আপ কার্ড</h1>
        <Button onClick={handleAddNew} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          নতুন কার্ড যোগ করুন
        </Button>
      </div>

      <Card>
        <CardHeader>
           <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="কার্ড খুঁজুন..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin"/></div>
            ) : (
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead className="w-[64px] sm:table-cell">
                  ছবি
                </TableHead>
                <TableHead>নাম</TableHead>
                <TableHead className="md:table-cell">ক্যাটাগরি</TableHead>
                <TableHead className="text-right sm:table-cell">মূল্য</TableHead>
                <TableHead>
                  <span className="sr-only">একশন</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards?.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="sm:table-cell">
                    <Image
                      alt={card.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={card.image?.src || 'https://placehold.co/64x64'}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{card.name}</TableCell>
                   <TableCell className="md:table-cell">
                    <Badge variant="outline">{getCategoryName(card.categoryId)}</Badge>
                   </TableCell>
                  <TableCell className="text-right sm:table-cell">
                    ৳{card.price.toFixed(2)}
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
                        <DropdownMenuItem onSelect={() => handleEdit(card)}>
                          এডিট
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(card.id)} className="text-red-500">মুছে ফেলুন</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            )}
        </CardContent>
         <CardFooter>
          <div className="text-xs text-muted-foreground">
            <strong>{cards?.length || 0}</strong> এর মধ্যে <strong>1-{cards?.length || 0}</strong> টি প্রোডাক্ট দেখানো হচ্ছে
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'কার্ড এডিট করুন' : 'নতুন কার্ড যোগ করুন'}
            </DialogTitle>
            <DialogDescription>
              টপ-আপ কার্ডের জন্য বিস্তারিত তথ্য পূরণ করুন।
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor="name">কার্ডের নাম</Label>
              <Input
                id="name"
                {...register('name', { required: 'নাম आवश्यक' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">বিবরণ</Label>
              <Textarea id="description" {...register('description')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">ছবির URL</Label>
              <Input
                id="imageUrl"
                {...register('imageUrl')}
                placeholder="https://example.com/image.png"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">ক্যাটাগরি</Label>
                  <Select
                    onValueChange={(value) => setValue('categoryId', value)}
                    value={watch('categoryId')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="একটি ক্যাটাগরি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="flex items-center pt-8 space-x-2">
                  <Switch
                    id="status-mode"
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                  />
                  <Label htmlFor="status-mode">সক্রিয়</Label>
                </div>
            </div>
            
            <div className="border-t my-4" />
            
             <div className="space-y-4">
                <Label>মূল্যের বিকল্প</Label>
                {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg bg-muted">
                    <div className="grid grid-cols-2 gap-2 flex-grow">
                        <div className="space-y-1">
                            <Label htmlFor={`options.${index}.name`} className="text-xs">বিকল্পের নাম</Label>
                            <Input {...register(`options.${index}.name` as const, { required: true })} placeholder="যেমন ১০০ ডায়মন্ড"/>
                        </div>
                        <div className="space-y-1">
                             <Label htmlFor={`options.${index}.price`} className="text-xs">মূল্য (৳)</Label>
                            <Input type="number" {...register(`options.${index}.price` as const, { required: true, valueAsNumber: true })} placeholder="যেমন ১০০" />
                        </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', price: 0 })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    বিকল্প যোগ করুন
                </Button>
             </div>


            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                বাতিল
              </Button>
              <Button type="submit">সংরক্ষণ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
