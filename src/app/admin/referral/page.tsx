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
      toast({ title: "সেটিংস সংরক্ষিত", description: "রেফারেল সেটিংস আপডেট করা হয়েছে।" });
    } catch (error: any) {
      console.error("Failed to save referral settings:", error);
      toast({ variant: 'destructive', title: "সংরক্ষণ ব্যর্থ", description: error.message || "সেটিংস আপডেট করা যায়নি।" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>রেফারেল সিস্টেম সেটিংস</CardTitle>
          <CardDescription>
            রেফারেল সিস্টেম কীভাবে কাজ করবে তা কনফিগার করুন।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="signup-bonus">সাইন-আপ বোনাস (পয়েন্ট)</Label>
                <Input
                  id="signup-bonus"
                  type="number"
                  placeholder="যেমন, ১০০"
                  {...register('signupBonus', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  একজন নতুন ব্যবহারকারী রেফারেল কোড দিয়ে সাইন আপ করলে যে পয়েন্ট পাবেন।
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referrer-bonus">রেফারার বোনাস (পয়েন্ট)</Label>
                <Input
                  id="referrer-bonus"
                  type="number"
                  placeholder="যেমন, ২০০"
                  {...register('referrerBonus', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  একজন রেফারার তার রেফার করা ব্যবহারকারী সাইন আপ করলে যে পয়েন্ট পাবেন।
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-order-bonus">রেফারার প্রথম অর্ডার বোনাস (পয়েন্ট)</Label>
                <Input
                  id="first-order-bonus"
                  type="number"
                  placeholder="যেমন, ৫০০"
                  {...register('firstOrderBonus', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  রেফার করা ব্যবহারকারী প্রথম অর্ডার সম্পন্ন করলে রেফারারের জন্য বোনাস পয়েন্ট।
                </p>
              </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>ক্রয়-ভিত্তিক বোনাস</CardTitle>
                    <CardDescription>ব্যবহারকারীদের তাদের মোট খরচের উপর ভিত্তি করে পয়েন্ট দিয়ে পুরস্কৃত করুন।</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-2 gap-4">
                          <div className='space-y-2'>
                              <Label htmlFor={`purchase-threshold-${index}`}>মোট খরচ (৳)</Label>
                              <Input type="number" {...register(`purchaseBonusTiers.${index}.threshold`, { valueAsNumber: true })} />
                          </div>
                          <div className='space-y-2'>
                              <Label htmlFor={`purchase-bonus-${index}`}>বোনাস পয়েন্ট</Label>
                              <Input type="number" {...register(`purchaseBonusTiers.${index}.bonus`, { valueAsNumber: true })} />
                          </div>
                      </div>
                    ))}
                     <Button type="button" variant="outline" size="sm" onClick={() => append({ threshold: 0, bonus: 0 })}>নতুন ধাপ যোগ করুন</Button>
                </CardContent>
            </Card>

            <Button className="w-full sm:w-auto" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                সেটিংস সংরক্ষণ করুন
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
