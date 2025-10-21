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
import { Save } from 'lucide-react'

export default function ReferralSettingsPage() {
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
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="signup-bonus">Sign-up Bonus (Points)</Label>
              <Input
                id="signup-bonus"
                type="number"
                placeholder="e.g., 100"
                defaultValue="100"
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
                defaultValue="200"
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
                defaultValue="500"
              />
               <p className="text-sm text-muted-foreground">
                Bonus points for the referrer when their referred user completes their first order.
              </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Purchase-based Bonuses</CardTitle>
                    <CardDescription>Reward users with points based on their total spending.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className='space-y-2'>
                            <Label htmlFor="purchase-threshold-1">Total Spent (৳)</Label>
                            <Input id="purchase-threshold-1" type="number" defaultValue="1000" />
                        </div>
                         <div className='space-y-2'>
                            <Label htmlFor="purchase-bonus-1">Bonus Points</Label>
                            <Input id="purchase-bonus-1" type="number" defaultValue="100" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className='space-y-2'>
                            <Label htmlFor="purchase-threshold-2">Total Spent (৳)</Label>
                            <Input id="purchase-threshold-2" type="number" defaultValue="5000" />
                        </div>
                         <div className='space-y-2'>
                            <Label htmlFor="purchase-bonus-2">Bonus Points</Label>
                            <Input id="purchase-bonus-2" type="number" defaultValue="600" />
                        </div>
                     </div>
                     <Button variant="outline" size="sm">Add Tier</Button>
                </CardContent>
            </Card>

            <Button className="w-full sm:w-auto" type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
