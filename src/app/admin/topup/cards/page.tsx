
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { topUpCategories, TopUpCardData } from '@/lib/data'; // Using mock data for now
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const cardSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Card name is required.'),
  description: z.string().min(1, 'Description is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  imageUrl: z.string().url('Please enter a valid image URL.'),
  categoryId: z.string().min(1, "Please select a category."),
  // for options like '100 diamonds', '500 diamonds'
  optionsEnabled: z.boolean(),
  options: z.array(z.object({
    name: z.string().min(1, "Option name is required"),
    price: z.coerce.number().min(0, "Price must be positive")
  })).optional(),
});

type CardFormValues = z.infer<typeof cardSchema>;

// Flatten cards from categories for initial state
const allCards = topUpCategories.flatMap(cat => cat.cards ? cat.cards.map(card => ({...card, categoryName: cat.name})) : []);

export default function TopupCardsPage() {
  const { toast } = useToast();
  const [cards, setCards] = useState(allCards);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<(TopUpCardData & {categoryName?: string}) | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      categoryId: '',
      optionsEnabled: false,
      options: []
    },
  });
  
  const optionsEnabled = watch('optionsEnabled');

  const openDialogForEdit = (card: TopUpCardData) => {
    setEditingCard(card);
    reset({
        ...card,
        imageUrl: card.image.src,
        optionsEnabled: !!card.options && card.options.length > 0,
    });
    setIsDialogOpen(true);
  };
  
  const openDialogForNew = () => {
    setEditingCard(null);
    reset();
    setIsDialogOpen(true);
  };

  const onSubmit = (data: CardFormValues) => {
    const cardData = {
        ...data,
        image: {src: data.imageUrl, hint: 'gaming currency'},
        price: data.optionsEnabled ? 0 : data.price, // if options, base price is 0
        options: data.optionsEnabled ? data.options : undefined,
    }
    
    if (editingCard) {
        setCards(cards.map(c => c.id === editingCard.id ? { ...cardData, id: c.id, categoryName: topUpCategories.find(cat => cat.id === data.categoryId)?.name } : c));
        toast({ title: "Card Updated", description: "The top-up card has been successfully updated." });
    } else {
        setCards([...cards, { ...cardData, id: String(Date.now()), categoryName: topUpCategories.find(cat => cat.id === data.categoryId)?.name }]);
        toast({ title: "Card Created", description: "The new top-up card has been added." });
    }
    setIsDialogOpen(false);
    setEditingCard(null);
  };

  const handleDelete = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
    toast({ title: "Card Deleted", description: "The card has been deleted." });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Top-up Cards</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openDialogForNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>{editingCard ? 'Edit Card' : 'Add New Card'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Card Name</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {topUpCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.categoryId && <p className="text-red-500 text-sm">{errors.categoryId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" {...register('description')} />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" {...register('imageUrl')} />
                   {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Controller
                        name="optionsEnabled"
                        control={control}
                        render={({ field }) => (
                            <Switch
                                id="optionsEnabled"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label htmlFor="optionsEnabled">Enable Multiple Options (e.g., 100 Diamonds, 500 Diamonds)</Label>
                </div>

                {optionsEnabled ? (
                    <div className="space-y-4 p-4 border rounded-md">
                        <Label>Card Options</Label>
                         {/* TODO: Implement dynamic add/remove for options */}
                        <div className="text-sm text-muted-foreground">Dynamic options form will be here.</div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="price">Price (৳)</Label>
                        <Input id="price" type="number" {...register('price')} />
                        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                    </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Save Card</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="md:table-cell">Price</TableHead>
              <TableHead className="md:table-cell">Options</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card.id}>
                <TableCell className="font-medium">{card.name}</TableCell>
                <TableCell>{card.categoryName || card.categoryId}</TableCell>
                <TableCell className="hidden md:table-cell">৳{card.price.toFixed(2)}</TableCell>
                <TableCell className="hidden md:table-cell">{card.options ? card.options.length : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuItem onClick={() => openDialogForEdit(card)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                       </DropdownMenuItem>
                       <DropdownMenuItem className="text-red-500" onClick={() => card.id && handleDelete(card.id)}>
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
