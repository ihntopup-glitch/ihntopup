'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useDoc, useFirestore, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import type { PaymentSettings } from '@/lib/data';
import { Loader2, Save } from 'lucide-react'
import { doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export default function PaymentSettingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const settingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'payment') : null, [firestore]);
  const { data: settings, isLoading } = useDoc<PaymentSettings>(settingsRef);

  const [currentMode, setCurrentMode] = useState<'manual' | 'automatic'>('automatic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setCurrentMode(settings.mode);
    }
  }, [settings]);

  const onSubmit = async () => {
    if (!settingsRef) return;
    setIsSubmitting(true);
    try {
      await setDocumentNonBlocking(settingsRef, { mode: currentMode });
      toast({ title: "সেটিংস সংরক্ষিত", description: "পেমেন্ট মোড সফলভাবে আপডেট করা হয়েছে।" });
    } catch (error: any) {
      console.error("Failed to save payment settings:", error);
      toast({ variant: 'destructive', title: "সংরক্ষণ ব্যর্থ", description: error.message || "সেটিংস আপডেট করা যায়নি।" });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

  return (
    <div className="grid gap-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>পেমেন্ট সেটিংস</CardTitle>
          <CardDescription>
            ম্যানুয়াল এবং অটোমেটিক পেমেন্ট পদ্ধতির মধ্যে পরিবর্তন করুন।
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <RadioGroup value={currentMode} onValueChange={(value: 'manual' | 'automatic') => setCurrentMode(value)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <RadioGroupItem value="automatic" id="automatic" className="peer sr-only" />
                    <Label
                    htmlFor="automatic"
                    className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                        "peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    )}
                    >
                        <h3 className="text-lg font-bold mb-2">অটোমেটিক</h3>
                        <p className="text-sm text-muted-foreground">অর্ডারগুলি ওয়ালেট বা পেমেন্ট গেটওয়ের মাধ্যমে স্বয়ংক্রিয়ভাবে প্রসেস হবে।</p>
                    </Label>
                </div>

                <div>
                    <RadioGroupItem value="manual" id="manual" className="peer sr-only" />
                    <Label
                    htmlFor="manual"
                    className={cn(
                        "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground",
                        "peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    )}
                    >
                        <h3 className="text-lg font-bold mb-2">ম্যানুয়াল</h3>
                         <p className="text-sm text-muted-foreground">ব্যবহারকারীরা একটি ফর্ম পূরণ করে পেমেন্টের তথ্য জমা দেবেন এবং অ্যাডমিনকে তা যাচাই করতে হবে।</p>
                    </Label>
                </div>
            </RadioGroup>

            <Button className="w-full sm:w-auto" onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                সেটিংস সংরক্ষণ করুন
            </Button>
        </CardContent>
      </Card>
    </div>
  )
}
