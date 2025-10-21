'use client'

import * as React from 'react'
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import { Separator } from '@/components/ui/separator'

const cards = [
  {
    id: 'card001',
    name: 'Free Fire 1080 Diamonds',
    category: 'Gaming',
    price: 9.99,
    status: 'Active',
    imageUrl: 'https://picsum.photos/seed/ff1080/64/64',
  },
  {
    id: 'card002',
    name: 'PUBG Mobile 600 UC',
    category: 'Gaming',
    price: 9.99,
    status: 'Active',
    imageUrl: 'https://picsum.photos/seed/pubg600/64/64',
  },
  {
    id: 'card003',
    name: 'Netflix 1 Month',
    category: 'Streaming',
    price: 15.49,
    status: 'Draft',
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
    reset()
    setIsDialogOpen(true)
  }

  const onSubmit = (data: CardFormValues) => {
    console.log(data)
    setIsDialogOpen(false)
  }

  const getStatusBadgeVariant = (status: Card['status']) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Top-Up Cards</h1>
        <Button onClick={handleAddNew} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Cards</CardTitle>
          <CardDescription>
            Add, edit, or delete top-up cards for each category.
          </CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search cards..." className="pl-8 w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">
                  Image
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="sm:table-cell">Category</TableHead>
                <TableHead className="sm:table-cell text-right">Price</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[50px]">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell>
                    <Image
                      alt={card.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={card.imageUrl}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{card.name}</TableCell>
                  <TableCell className="sm:table-cell">{card.category}</TableCell>
                  <TableCell className="sm:table-cell text-right">
                    ৳{card.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeVariant(card.status)}
                    >
                      {card.status}
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
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" {...register('imageUrl')} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status-mode"
                {...register('status')}
              />
              <Label htmlFor="status-mode">Active</Label>
            </div>
            
            <Separator />
            
            {hasOptions ? (
                 <div className="space-y-4">
                    <Label>Pricing Options</Label>
                    {fields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2">
                        <div className="flex-1">
                            <Label htmlFor={`options.${index}.name`} className="text-xs">Option Name</Label>
                            <Input {...register(`options.${index}.name` as const, { required: true })} />
                        </div>
                        <div className="flex-1">
                             <Label htmlFor={`options.${index}.price`} className="text-xs">Price (৳)</Label>
                            <Input type="number" {...register(`options.${index}.price` as const, { required: true, valueAsNumber: true })} />
                        </div>
                        <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>Remove</Button>
                    </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', price: 0 })}>Add Option</Button>
                 </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="price">Price (৳)</Label>
                    <Input id="price" type="number" {...register('price', { valueAsNumber: true })} />
                </div>
            )}


            <DialogFooter className="mt-4">
              <Button
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
