'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getBengaliErrorMessage } from '@/lib/error-messages';

export default function ForgotPasswordPage() {
  const auth = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        variant: 'destructive',
        title: 'ইমেইল প্রয়োজন',
        description: 'অনুগ্রহ করে আপনার ইমেইল ঠিকানা লিখুন।',
      });
      return;
    }

    setIsLoading(true);
    if (!auth) {
        toast({ variant: "destructive", title: "ত্রুটি", description: "অনুমোদন পরিষেবা উপলব্ধ নেই।" });
        setIsLoading(false);
        return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'রিসেট লিঙ্ক পাঠানো হয়েছে',
        description: 'আপনার ইমেইল ঠিকানায় একটি পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে।',
      });
      setIsSent(true);
    } catch (error: any) {
      const errorMessage = getBengaliErrorMessage(error.code);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12 fade-in">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="p-3 bg-white rounded-2xl shadow-md mb-4 z-10">
          <Image src="https://i.imgur.com/bJH9BH5.png" alt="IHN TOPUP Logo" width={48} height={48} />
        </div>
        <CardTitle className="text-2xl">পাসওয়ার্ড ভুলে গেছেন</CardTitle>
        <CardDescription className="mt-1">
          {isSent
            ? 'রিসেট লিঙ্কের জন্য আপনার ইনবক্স চেক করুন।'
            : 'পাসওয়ার্ড রিসেট লিঙ্ক পেতে আপনার ইমেল লিখুন।'}
        </CardDescription>
      </div>

      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardContent className="pt-6">
          {isSent ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                আপনি যদি ইমেলটি না পান তবে অনুগ্রহ করে আপনার স্প্যাম ফোল্ডার চেক করুন।
              </p>
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  লগইনে ফিরে যান
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল ঠিকানা</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="আপনার ইমেইল লিখুন"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleResetPassword} className="w-full text-lg h-12" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                রিসেট লিঙ্ক পাঠান
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  বাতিল
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
