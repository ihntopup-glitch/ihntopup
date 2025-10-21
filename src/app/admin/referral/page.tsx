
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const referralSettingsSchema = z.object({
  registrationBonus: z.coerce.number().min(0, 'Registration bonus must be positive.'),
  spendingTiers: z.array(z.object({
    amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
    points: z.coerce.number().min(1, 'Points must be greater than 0.'),
  })),
});

type ReferralSettingsFormValues = z.infer<typeof referralSettingsSchema>;

export default function ReferralSettingsPage() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ReferralSettingsFormValues>({
    resolver: zodResolver(referralSettingsSchema),
    defaultValues: {
      registrationBonus: 100, // Default value
      spendingTiers: [
        { amount: 1000, points: 50 },
        { amount: 2000, points: 120 },
      ],
    },
  });
  
  const onSubmit = (data: ReferralSettingsFormValues) => {
    console.log(data);
    toast({
      title: 'Settings Saved',
      description: 'Your referral settings have been updated successfully.',
    });
  };

  const addTier = () => {
    const currentTiers = getValues('spendingTiers');
    setValue('spendingTiers', [...currentTiers, { amount: 0, points: 0 }]);
  };

  const removeTier = (index: number) => {
    const currentTiers = getValues('spendingTiers');
    setValue('spendingTiers', currentTiers.filter((_, i) => i !== index));
  };


  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Referral System Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Registration Bonus</CardTitle>
            <CardDescription>
              Set the number of points a new user gets when they register using a referral code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm space-y-2">
              <Label htmlFor="registrationBonus">Points for New Registration</Label>
              <Input
                id="registrationBonus"
                type="number"
                {...register('registrationBonus')}
              />
               {errors.registrationBonus && <p className="text-red-500 text-sm">{errors.registrationBonus.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending-based Rewards</CardTitle>
            <CardDescription>
              Reward referrers with points when their referred users reach certain spending milestones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {getValues('spendingTiers').map((tier, index) => (
              <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                <div className="grid flex-grow grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor={`tier-amount-${index}`}>Total Spending Amount (৳)</Label>
                        <Input
                        id={`tier-amount-${index}`}
                        type="number"
                        {...register(`spendingTiers.${index}.amount`)}
                        />
                         {errors.spendingTiers?.[index]?.amount && <p className="text-red-500 text-sm">{errors.spendingTiers?.[index]?.amount?.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`tier-points-${index}`}>Points to Award</Label>
                        <Input
                        id={`tier-points-${index}`}
                        type="number"
                        {...register(`spendingTiers.${index}.points`)}
                        />
                         {errors.spendingTiers?.[index]?.points && <p className="text-red-500 text-sm">{errors.spendingTiers?.[index]?.points?.message}</p>}
                    </div>
                </div>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeTier(index)}>
                  Remove
                </Button>
              </div>
            ))}
             <Button type="button" variant="outline" onClick={addTier}>
              Add Spending Tier
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
