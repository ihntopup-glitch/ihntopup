'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth as useFirebaseAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";
import Image from 'next/image';

const saveUserToFirestore = async (firestore: any, user: User, name?: string) => {
    const userRef = doc(firestore, "users", user.uid);
    try {
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
            // For a brand new user, create the document with default values
            setDocumentNonBlocking(userRef, {
                id: user.uid,
                name: name || user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                walletBalance: 0,
                referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
                isVerified: user.emailVerified,
                isAdmin: false, // Explicitly set to false for all new sign-ups
                savedGameUids: [],
            });
        }
        // If the user document already exists (e.g., from a previous login), we don't need to do anything
        // as their `isAdmin` status should be preserved.
    } catch (error) {
        console.error("Error saving user to Firestore:", error);
    }
};

export default function SignupPage() {
    const auth = useFirebaseAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleSignup = async () => {
        setIsLoading(true);
        if (!auth || !firestore) {
            toast({ variant: "destructive", title: "Signup Failed", description: "Authentication service not available." });
            setIsLoading(false);
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });
                await saveUserToFirestore(firestore, userCredential.user, name);
            }
            toast({ title: "Signup Successful", description: "Welcome!" });
            router.push('/');
        } catch (error: any) {
            toast({ variant: "destructive", title: "Signup Failed", description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        if (!auth || !firestore) {
            toast({ variant: "destructive", title: "Google Login Failed", description: "Authentication service not available." });
            setIsGoogleLoading(false);
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await saveUserToFirestore(firestore, result.user);
            toast({ title: "Login Successful", description: "Welcome!" });
            router.push('/');
        } catch (error: any) {
            toast({ variant: "destructive", title: "Google Login Failed", description: error.message });
        } finally {
            setIsGoogleLoading(false);
        }
    };


  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12 fade-in pt-20 pb-24">
        <div className="flex flex-col items-center text-center mb-8">
            <div className="p-3 bg-white rounded-2xl shadow-md mb-4 z-10">
                 <Image src="https://i.imgur.com/bJH9BH5.png" alt="IHN TOPUP Logo" width={48} height={48} />
            </div>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <p className="text-muted-foreground mt-1">Join us and start topping up!</p>
        </div>

      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading}>
               {isGoogleLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-5 w-5" />
              )}
              Sign up with Google
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
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your full name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="Enter your email address" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <Button onClick={handleSignup} className="w-full text-lg h-12" disabled={isLoading || isGoogleLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Sign Up
            </Button>
          </div>

            <div className="mt-4 text-center text-sm">
                <p>
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-green-600 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
