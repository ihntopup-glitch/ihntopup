'use client';

import { useState } from 'react';
import type { TopUpCardData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Minus, Plus, ShoppingCart, Zap, Gem, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from './ui/alert';
import { CreditCardIcon } from '@/components/icons';

interface TopUpDetailClientProps {
  card: TopUpCardData;
}

const SectionCard: React.FC<{ title: string, step?: string, children: React.ReactNode, className?:string }> = ({ title, step, children, className }) => (
    <Card className={cn("border-l-4 border-green-500 shadow-md", className)}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            {step && <div className="bg-green-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">{step}</div>}
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);


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
        <h1 className="text-3xl lg:text-4xl font-bold font-headline mb-6">{card.name}</h1>
        <Card className="overflow-hidden bg-gradient-to-br from-green-500 to-green-700/80 backdrop-blur-sm shadow-lg">
          <div className="relative w-full h-[190px] flex items-center justify-center">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white text-center tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}>
                {card.name.toUpperCase()}
            </h2>
          </div>
        </Card>
        
        {hasOptions && (
          <SectionCard title="Select Recharge" step="1" className="mt-8">
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
          </SectionCard>
        )}

      </div>

      <div className="space-y-6">

        <SectionCard title="Account Info" step={hasOptions ? "2" : "1"}>
            <div className="space-y-2">
                <Label htmlFor="uid">Player ID</Label>
                <Input id="uid" placeholder="Enter player id" value={uid} onChange={(e) => setUid(e.target.value)} />
            </div>
        </SectionCard>

        <SectionCard title="Quantity" step={hasOptions ? "3" : "2"}>
            <div className="flex items-center gap-4 justify-center">
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
                </Button>
                <span className="w-16 text-center font-bold text-2xl">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>
                <Plus className="h-4 w-4" />
                </Button>
            </div>
        </SectionCard>

        <SectionCard title="Select Payment" step={hasOptions ? "4" : "3"}>
          <RadioGroup defaultValue="wallet" className="mt-2 grid grid-cols-2 gap-4" onValueChange={setPaymentMethod}>
            <div>
              <RadioGroupItem value="wallet" id="wallet" className="peer sr-only" />
              <Label htmlFor="wallet" className="flex flex-col text-center items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <Zap className="h-6 w-6 mb-2" />
                Instant Pay (Wallet)
              </Label>
            </div>
            <div>
              <RadioGroupItem value="gateway" id="gateway" className="peer sr-only" />
              <Label htmlFor="gateway" className="flex flex-col text-center items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                <CreditCardIcon className="h-6 w-6 mb-2" />
                Payment Gateway
              </Label>
            </div>
          </RadioGroup>
            <Alert className="mt-4 border-blue-500 text-blue-800">
                <Info className="h-4 w-4 !text-blue-500" />
                <AlertDescription className="text-sm">
                    আপনার অ্যাকাউন্ট ব্যালেন্স ৳0.00
                </AlertDescription>
            </Alert>
            <Alert className="mt-2 border-orange-500 text-orange-800">
                <Info className="h-4 w-4 !text-orange-500" />
                <AlertDescription className="text-sm">
                    প্রোডাক্ট কিনতে আপনার প্রয়োজন ৳{finalPrice.toFixed(2)}
                </AlertDescription>
            </Alert>
        </SectionCard>
        
        <Card className="shadow-md">
            <CardContent className="pt-6">
                <div className="flex gap-2 mb-4">
                    <Input placeholder="Coupon Code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                    <Button variant="outline">Apply</Button>
                </div>

                <Separator />

                <div className="space-y-2 mt-4">
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

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <Button variant="outline" size="lg" onClick={handleAddToCart} className="text-base">
                        <ShoppingCart className="mr-2" /> Add to Cart
                    </Button>
                    <Button size="lg" onClick={handleOrderNow} className="text-base font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                        <Zap className="mr-2" /> BUY NOW
                    </Button>
                </div>
            </CardContent>
        </Card>
        <SectionCard title="Description" className="mt-8">
             <p className='text-muted-foreground text-sm'>{card.description}</p>
        </SectionCard>

      </div>
    </div>
  );
}
