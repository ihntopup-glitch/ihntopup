'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GoogleIcon } from "@/components/icons";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = () => {
        // Here you would typically perform authentication
        login();
        router.push('/profile');
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] px-4 fade-in">
        <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 bg-white rounded-2xl shadow-md mb-4 -mt-16 z-10">
                 <CreditCard className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-green-600 font-headline">IHN TOPUP</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Login to continue</p>
        </div>

      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full">
              <GoogleIcon className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter your email address" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" required />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="font-normal">Remember me</Label>
            </div>
            <Button onClick={handleLogin} className="w-full text-lg h-12">
              Sign In
            </Button>
          </div>

            <div className="mt-4 text-center text-sm">
                <p>
                    Don't have an account?{" "}
                    <Link href="/signup" className="font-bold text-green-600 hover:underline">
                        Sign Up
                    </Link>
                </p>
                <p className="mt-2">
                    Forgot your password?{" "}
                    <Link href="#" className="font-bold text-green-600 hover:underline">
                        Reset Password
                    </Link>
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
