'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth as useFirebaseAuth } from '@/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function ResetPasswordComponent() {
  const auth = useFirebaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [oobCode, setOobCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const code = searchParams.get('oobCode');
    if (!code) {
      setError('Invalid or missing password reset code.');
      setIsLoading(false);
      return;
    }
    if (!auth) {
        setError('Authentication service not available.');
        setIsLoading(false);
        return;
    }
    setOobCode(code);

    verifyPasswordResetCode(auth, code)
      .then(() => {
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'The reset link is invalid or has expired. Please try again.');
        setIsLoading(false);
      });
  }, [searchParams, auth]);

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
      return;
    }
    if (!oobCode) {
      toast({ variant: 'destructive', title: 'Error', description: 'Missing reset code.' });
      return;
    }
     if (!auth) {
        toast({ variant: "destructive", title: "Error", description: "Authentication service not available." });
        return;
    }

    setIsResetting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast({ title: 'Success', description: 'Your password has been reset successfully.' });
      setIsSuccess(true);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12 fade-in">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="p-3 bg-white rounded-2xl shadow-md mb-4 z-10">
          <Image src="https://i.imgur.com/bJH9BH5.png" alt="IHN TOPUP Logo" width={48} height={48} />
        </div>
        <CardTitle className="text-2xl">Reset Your Password</CardTitle>
        <CardDescription className="mt-1">
          {isSuccess ? 'You can now log in with your new password.' : 'Enter your new password below.'}
        </CardDescription>
      </div>

      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-destructive">
              <p>{error}</p>
              <Button asChild className="mt-4">
                <Link href="/forgot-password">Request a New Link</Link>
              </Button>
            </div>
          ) : isSuccess ? (
             <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Your password has been successfully updated.
              </p>
              <Button asChild className="w-full">
                <Link href="/login">
                  Proceed to Login
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  disabled={isResetting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  disabled={isResetting}
                />
              </div>
              <Button onClick={handleResetPassword} className="w-full text-lg h-12" disabled={isResetting}>
                {isResetting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Reset Password
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>}>
            <ResetPasswordComponent />
        </Suspense>
    )
}
