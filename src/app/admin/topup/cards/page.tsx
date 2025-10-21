'use client'

import * as React from 'react'
import { MoreHorizontal, PlusCircle, Search, Trash2 } from 'lucide-react'

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

const cards = [
  {
    id: 'card001',
    name: 'Free Fire 1080 Diamonds',
    category: 'Gaming',
    price: 9.99,
    stock: 100,
    status: 'Active',
    imageUrl: 'https://picsum.photos/seed/ff1080/64/64',
  },
  {
    id: 'card002',
    name: 'PUBG Mobile 600 UC',
    category: 'Gaming',
    price: 9.99,
    stock: 50,
    status: 'Active',
    imageUrl: 'https://picsum.photos/seed/pubg600/64/64',
  },
  {
    id: 'card003',
    name: 'Netflix 1 Month',
    category: 'Streaming',
    price: 15.49,
    stock: 0,
    status: 'Archived',
    imageUrl: 'https://picsum.photos/seed/netflix1m/64/64',
  },
]

type Card = (typeof cards)[0]

type CardFormValues = {
  name: string
  description: string
  imageUrl: string
  category: string
  status: boolean
  price?: number
  options: { name: string; price: number }[]
}

export default function TopupCardsPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingCard, setEditingCard] = React.useState<Card | null>(null)

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
      category: '',
      status: true,
      price: undefined,
      options: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  })

  const hasOptions = watch('options').length > 0

  const handleEdit = (card: Card) => {
    setEditingCard(card)
    reset({
      name: card.name,
      description: 'Mock description',
      imageUrl: card.imageUrl,
      category: card.category,
      status: card.status === 'Active',
      price: card.price,
      options: [], // In a real app, you'd fetch and set options
    })
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingCard(null)
    reset({
        name: '',
        description: '',
        imageUrl: '',
        category: '',
        status: true,
        price: undefined,
        options: [{ name: '', price: 0 }]
    })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: CardFormValues) => {
    console.log(data)
    setIsDialogOpen(false)
  }

  const getStatusBadgeVariant = (status: Card['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'Archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
       <div className="flex items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold">Top-Up Cards</h1>
        <Button onClick={handleAddNew} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      <Card>
        <CardHeader>
           <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search cards..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                 <TableHead className="w-[64px] sm:table-cell">
                  Image
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="md:table-cell">Category</TableHead>
                <TableHead className="text-right sm:table-cell">Price</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="sm:table-cell">
                    <Image
                      alt={card.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={card.imageUrl}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{card.name}</TableCell>
                   <TableCell className="md:table-cell">
                    <Badge variant="outline">{card.category}</Badge>
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
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEdit(card)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{cards.length}</strong> of <strong>{cards.length}</strong> products
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Edit Card' : 'Add New Card'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the top-up card.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Card Name</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                {...register('imageUrl')}
                placeholder="https://example.com/image.png"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) => setValue('category', value)}
                    defaultValue={editingCard?.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Streaming">Streaming</SelectItem>
                      <SelectItem value="Gift Cards">Gift Cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="flex items-center pt-8 space-x-2">
                  <Switch
                    id="status-mode"
                    {...register('status')}
                  />
                  <Label htmlFor="status-mode">Active</Label>
                </div>
            </div>
            
            <div className="border-t my-4" />
            
             <div className="space-y-4">
                <Label>Pricing Options</Label>
                {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg bg-muted">
                    <div className="grid grid-cols-2 gap-2 flex-grow">
                        <div className="space-y-1">
                            <Label htmlFor={`options.${index}.name`} className="text-xs">Option Name</Label>
                            <Input {...register(`options.${index}.name` as const, { required: true })} placeholder="e.g. 100 Diamonds"/>
                        </div>
                        <div className="space-y-1">
                             <Label htmlFor={`options.${index}.price`} className="text-xs">Price (৳)</Label>
                            <Input type="number" {...register(`options.${index}.price` as const, { required: true, valueAsNumber: true })} placeholder="e.g. 100" />
                        </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', price: 0 })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Option
                </Button>
             </div>


            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
