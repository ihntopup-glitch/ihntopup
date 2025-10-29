'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AboutPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto px-4 py-8 fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold font-headline">About Us</h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>About IHN TOPUP</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            IHN TOPUP is a digital gaming top-up platform that helps players purchase in-game currency,
            vouchers, and gift cards quickly and securely.
          </p>
          <p>
            We use Google Sign-In to provide a secure and convenient login experience. 
            This allows users to log in without creating a separate password, keeping their accounts safe.
          </p>
          <p>
            IHN TOPUP ensures all user data is protected and handled responsibly.
            For more details, please visit our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
