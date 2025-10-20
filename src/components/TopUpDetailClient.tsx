'use client';

import { useState } from 'react';
import type { TopUpCardData } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, ShoppingCart, Zap, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopUpDetailClientProps {
  card: TopUpCardData;
}

export default function TopUpDetailClient({ card }: TopUpDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [uid, setUid] = useState('');
  const [coupon, setCoupon] = useState('');
  const [selectedOption, setSelectedOption] = useState(card.options ? card.options[0] : undefined);
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  const price = selectedOption ? selectedOption.price : card.price;
  const totalPrice = price * quantity;
  const discount = coupon === 'IHN10' ? totalPrice * 0.1 : 0;
  const finalPrice = totalPrice - discount;

  const handleAddToCart = () => {
    addToCart({ card, quantity, selectedOption });
    toast({
      title: 'Added to cart',
      description: `${quantity} x ${card.name} ${selectedOption ? `(${selectedOption.name})` : ''} has been added to your cart.`,
    });
  };

  const handleOrderNow = () => {
    if (!uid) {
        toast({
            variant: 'destructive',
            title: 'UID Required',
            description: 'Please enter your Game UID.',
        });
        return;
    }
    // Mock order processing
    toast({
        title: 'Order Placed!',
        description: `Your order for ${quantity} x ${card.name} is being processed.`,
    });
  };

  const hasOptions = card.options && card.options.length > 0;

  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      <div>
        <Card className="overflow-hidden">
          <div className="relative aspect-square w-full">
            <Image
              src={card.image.src}
              alt={card.name}
              fill
              className="object-cover"
              data-ai-hint={card.image.hint}
            />
          </div>
        </Card>
        <div className='mt-4'>
            <h2 className="text-xl font-bold font-headline mt-6 mb-2">Description</h2>
            <p className='text-muted-foreground'>{card.description}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl lg:text-4xl font-bold font-headline">{card.name}</h1>
        
        {hasOptions ? (
          <div>
            <Label className="text-lg font-semibold mb-2 block">Select Recharge</Label>
            <div className="grid grid-cols-2 gap-3">
              {card.options!.map((option) => (
                <button
                  key={option.name}
                  onClick={() => setSelectedOption(option)}
                  className={cn(
                    "border-2 rounded-lg p-3 text-left transition-all",
                    "flex justify-between items-center",
                    selectedOption?.name === option.name
                      ? "border-primary bg-primary/10"
                      : "border-input bg-background hover:bg-muted"
                  )}
                >
                  <span className="font-medium text-sm flex items-center gap-1.5">
                    <Gem className="h-4 w-4 text-blue-400" /> {option.name}
                  </span>
                  <span className="font-bold text-primary text-sm">৳{option.price}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
            <p className="text-3xl font-bold text-primary">৳{price.toFixed(2)}</p>
        )}

        <div className="space-y-2">
            <Label htmlFor="uid">Game UID</Label>
            <Input id="uid" placeholder="Enter your in-game User ID" value={uid} onChange={(e) => setUid(e.target.value)} />
        </div>

        <div className="flex items-center gap-4">
          <Label>Quantity</Label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center font-bold text-lg">{quantity}</span>
            <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label>Payment Method</Label>
          <RadioGroup defaultValue="wallet" className="mt-2 grid grid-cols-2 gap-4" onValueChange={setPaymentMethod}>
            <div>
              <RadioGroupItem value="wallet" id="wallet" className="peer sr-only" />
              <Label htmlFor="wallet" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                Instant Pay (Wallet)
              </Label>
            </div>
            <div>
              <RadioGroupItem value="gateway" id="gateway" className="peer sr-only" />
              <Label htmlFor="gateway" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                Payment Gateway
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex gap-2">
            <Input placeholder="Coupon Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            <Button variant="outline">Apply</Button>
        </div>

        <Separator />

        <div className="space-y-2">
            <div className="flex justify-between">
                <span>{selectedOption ? selectedOption.name : card.name} x {quantity}</span>
                <span>৳{totalPrice.toFixed(2)}</span>
            </div>
            {discount > 0 && (
                <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-৳{discount.toFixed(2)}</span>
                </div>
            )}
             <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>৳{finalPrice.toFixed(2)}</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" size="lg" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2" /> Add to Cart
            </Button>
            <Button size="lg" onClick={handleOrderNow}>
                <Zap className="mr-2" /> Order Now
            </Button>
        </div>

      </div>
    </div>
  );
}
