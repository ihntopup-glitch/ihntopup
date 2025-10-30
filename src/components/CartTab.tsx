
'use client';

import { useCart } from '@/contexts/CartContext';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import CheckoutDialog from './CheckoutDialog';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, getCountFromServer, limit } from 'firebase/firestore';
import type { Coupon } from '@/lib/data';
import { useFirestore } from '@/firebase';

const getCartItemId = (item: any) => `${item.card.id}-${item.selectedOption?.name}`;

export default function CartTab() {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    cartCount, 
    clearCart, 
    selectedItemIds, 
    toggleSelectItem,
    getSelectedItems 
  } = useCart();
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { isLoggedIn, firebaseUser, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  
  const selectedItems = useMemo(() => getSelectedItems(), [getSelectedItems]);
  
  const totalPrice = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      const price = item.selectedOption?.price ?? item.card.price;
      return total + price * item.quantity;
    }, 0);
  }, [selectedItems]);

  const discount = useMemo(() => {
      if (!appliedCoupon) return 0;
      const calculatedDiscount = appliedCoupon.type === 'Percentage' 
          ? totalPrice * (appliedCoupon.value / 100) 
          : appliedCoupon.value;
      return Math.min(calculatedDiscount, totalPrice); // Discount can't be more than total
  }, [appliedCoupon, totalPrice]);

  const finalPrice = useMemo(() => Math.max(0, totalPrice - discount), [totalPrice, discount]);


  const handleCheckout = () => {
    if (authLoading) return;
    
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (selectedItems.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No items selected',
            description: 'Please select items to checkout.',
        });
        return;
    }
    setIsCheckoutOpen(true);
  }
  
  const handleApplyCoupon = async () => {
    if (!couponCode) {
        toast({ variant: 'destructive', title: "Please enter a coupon code." });
        return;
    }
    if (!firestore || !firebaseUser) return;

    const couponsRef = collection(firestore, 'coupons');
    const q = query(couponsRef, where('code', '==', couponCode), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'Invalid Coupon', description: 'This coupon code does not exist.' });
        return;
    }
    
    const coupon = { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id } as Coupon;

    if (!coupon.isActive) {
        toast({ variant: 'destructive', title: 'Inactive Coupon', description: 'This coupon is no longer active.' });
        return;
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        toast({ variant: 'destructive', title: 'Expired Coupon', description: 'This coupon has expired.' });
        return;
    }
     if (coupon.minPurchaseAmount && totalPrice < coupon.minPurchaseAmount) {
        toast({ variant: 'destructive', title: 'Minimum purchase not met', description: `You need to spend at least ৳${coupon.minPurchaseAmount} to use this coupon.` });
        return;
    }

    const ordersRef = collection(firestore, 'orders');

    if (coupon.totalUsageLimit && coupon.totalUsageLimit > 0) {
        const totalUsageQuery = query(ordersRef, where('couponId', '==', coupon.id));
        const totalUsageSnap = await getCountFromServer(totalUsageQuery);
        if (totalUsageSnap.data().count >= coupon.totalUsageLimit) {
            toast({ variant: 'destructive', title: 'Coupon limit reached', description: 'This coupon has reached its total usage limit.' });
            return;
        }
    }

    const userCouponQuery = query(ordersRef, where('userId', '==', firebaseUser.uid), where('couponId', '==', coupon.id));
    const userCouponSnap = await getDocs(userCouponQuery);

    if (coupon.usageLimitPerUser && userCouponSnap.size >= coupon.usageLimitPerUser) {
        toast({ variant: 'destructive', title: 'Coupon already used', description: 'You have already reached the usage limit for this coupon.' });
        return;
    }

    setAppliedCoupon(coupon);
    toast({ title: 'Coupon Applied!', description: `You received a discount of ৳${discount.toFixed(2)}.` });
  }


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
    <>
    <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
            {cartItems.map(item => {
                const itemId = getCartItemId(item);
                const isSelected = selectedItemIds.includes(itemId);
                return (
                <Card key={itemId} className="flex items-center p-4">
                    <div className="flex items-center gap-4 flex-grow">
                        <Checkbox
                            id={`select-${itemId}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectItem(itemId)}
                            aria-label={`Select ${item.card.name}`}
                        />
                        <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden">
                            <Image src={item.card.image.src} alt={item.card.name} fill className="object-cover" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-semibold">{item.card.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.selectedOption?.name || `Standard`}</p>
                            <p className="text-sm font-bold">৳{(item.selectedOption?.price ?? item.card.price).toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.card.id, item.quantity - 1, item.selectedOption?.name)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold">{item.quantity}</span>
                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.card.id, item.quantity + 1, item.selectedOption?.name)}>
                            <Plus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.card.id, item.selectedOption?.name)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            )})}
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex gap-2">
                        <Input placeholder="Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                        <Button variant="outline" onClick={handleApplyCoupon}>Apply</Button>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal ({selectedItems.length} items)</span>
                        <span>৳{totalPrice.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>- ৳{discount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>৳{finalPrice.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleCheckout} disabled={authLoading || selectedItems.length === 0}>
                        {authLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Proceed to Checkout
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
    <CheckoutDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cartItems={selectedItems}
        totalAmount={finalPrice}
        coupon={appliedCoupon}
        onCheckoutSuccess={() => {
            // No need to clear the whole cart, just remove selected items
        }}
    />
    </>
  );
}
