'use client';

import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Separator } from './ui/separator';
import Link from 'next/link';

export default function CartTab() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, cartCount } = useCart();

  if (cartCount === 0) {
    return (
        <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Your cart is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                You have no items in your shopping cart.
            </p>
            <Button asChild className="mt-6 bg-primary hover:bg-accent">
                <Link href="/topup">Start Shopping</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
            {cartItems.map(item => (
                <Card key={`${item.card.id}-${item.selectedOption?.name}`} className="flex items-center p-4">
                    <div className="relative h-20 w-20 rounded-md overflow-hidden mr-4">
                        <Image src={item.card.image.src} alt={item.card.name} fill className="object-cover" />
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-semibold">{item.card.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.selectedOption?.name || `Standard`}</p>
                        <p className="text-sm font-bold">৳{(item.selectedOption?.price ?? item.card.price).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.card.id, item.quantity - 1, item.selectedOption?.name)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.card.id, item.quantity + 1, item.selectedOption?.name)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.card.id, item.selectedOption?.name)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>৳{totalPrice.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-muted-foreground">
                        <span>Discount</span>
                        <span>৳0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>৳{totalPrice.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full bg-primary hover:bg-accent">Proceed to Checkout</Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
