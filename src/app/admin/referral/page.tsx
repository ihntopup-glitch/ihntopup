'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import type { ReferralSettings } from '@/lib/data';
import { Loader2, Save } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form';
import { doc } from 'firebase/firestore';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type FormValues = Omit<ReferralSettings, 'id'>;

export default function ReferralSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'referral') : null, [firestore]);
  const { data: settings, isLoading } = useDoc<ReferralSettings>(settingsRef);

  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      signupBonus: 0,
      referrerBonus: 0,
      firstOrderBonus: 0,
      purchaseBonusTiers: [{ threshold: 0, bonus: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "purchaseBonusTiers"
  });

  useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!settingsRef) return;
    try {
      await setDocumentNonBlocking(settingsRef, data);
      toast({ title: "Settings Saved", description: "Referral settings have been updated." });
    } catch (error: any) {
      toast({ variant: 'destructive', title: "Save Failed", description: error.message });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Referral System Settings</CardTitle>
          <CardDescription>
            Configure how the referral system works.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="signup-bonus">Sign-up Bonus (Points)</Label>
                <Input
                  id="signup-bonus"
                  type="number"
                  placeholder="e.g., 100"
                  {...register('signupBonus', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  Points a new user gets for signing up with a referral code.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referrer-bonus">Referrer Bonus (Points)</Label>
                <Input
                  id="referrer-bonus"
                  type="number"
                  placeholder="e.g., 200"
                  {...register('referrerBonus', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  Points a referrer gets when their referred user signs up.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-order-bonus">Referrer First Order Bonus (Points)</Label>
                <Input
                  id="first-order-bonus"
                  type="number"
                  placeholder="e.g., 500"
                  {...register('firstOrderBonus', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  Bonus points for the referrer when their referred user completes their first order.
                </p>
              </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Purchase-based Bonuses</CardTitle>
                    <CardDescription>Reward users with points based on their total spending.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-2 gap-4">
                          <div className='space-y-2'>
                              <Label htmlFor={`purchase-threshold-${index}`}>Total Spent (৳)</Label>
                              <Input type="number" {...register(`purchaseBonusTiers.${index}.threshold`, { valueAsNumber: true })} />
                          </div>
                          <div className='space-y-2'>
                              <Label htmlFor={`purchase-bonus-${index}`}>Bonus Points</Label>
                              <Input type="number" {...register(`purchaseBonusTiers.${index}.bonus`, { valueAsNumber: true })} />
                          </div>
                      </div>
                    ))}
                     <Button type="button" variant="outline" size="sm" onClick={() => append({ threshold: 0, bonus: 0 })}>Add Tier</Button>
                </CardContent>
            </Card>

            <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
