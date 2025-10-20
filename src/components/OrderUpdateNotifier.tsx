'use client';

import { useState } from 'react';
import { orderUpdateNotifications } from '@/ai/flows/order-update-notifications';
import { Button } from './ui/button';
import { Loader2, BellRing } from 'lucide-react';
import type { Order } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';

interface OrderUpdateNotifierProps {
  order: Order;
}

const possibleUpdates = [
  "Your order is being prepared by the merchant.",
  "Your order has been dispatched and is on its way.",
  "Your digital code has been generated and sent to your email.",
  "There is a slight delay in processing your order. We'll update you shortly.",
  "Your order has been successfully delivered/completed."
];

export default function OrderUpdateNotifier({ order }: OrderUpdateNotifierProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckUpdate = async () => {
    setIsLoading(true);
    setNotification(null);
    try {
      const result = await orderUpdateNotifications({
        orderId: order.id,
        orderStatus: order.status,
        possibleUpdates: possibleUpdates,
      });
      setNotification(result.notificationMessage);
      toast({
        title: "Order Update",
        description: result.notificationMessage,
      })
    } catch (error) {
      console.error("Failed to get order update:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch order update. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleCheckUpdate} disabled={isLoading} className="flex-grow bg-primary hover:bg-accent">
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <BellRing className="mr-2 h-4 w-4" />
        )}
        Check for Updates
      </Button>
      {notification && (
        <Alert className="mt-4">
          <BellRing className="h-4 w-4" />
          <AlertTitle>Latest Update!</AlertTitle>
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
