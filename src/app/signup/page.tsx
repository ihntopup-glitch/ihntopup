'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleIcon } from "@/components/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useAuth as useFirebaseAuth, useFirestore, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, User, sendEmailVerification, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, collection, query, where, getDocs, writeBatch, limit } from "firebase/firestore";
import Image from 'next/image';
import type { ReferralSettings } from "@/lib/data";

const saveUserAndHandleReferral = async (firestore: any, user: User, referralCode?: string | null, name?: string) => {
    const userRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userRef);

    // If user document already exists, do nothing.
    if (userDoc.exists()) {
        return;
    }

    const batch = writeBatch(firestore);

    // 1. Create the new user document
    const newUserDoc: any = {
        id: user.uid,
        name: name || user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        walletBalance: 0,
        referralCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        isVerified: user.emailVerified,
        isAdmin: false,
        savedGameUids: [],
        points: 0,
    };

    // Handle referral if code is provided
    if (referralCode) {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('referralCode', '==', referralCode), limit(1));
        const referrerSnap = await getDocs(q);

        if (!referrerSnap.empty) {
            const referrerDoc = referrerSnap.docs[0];
            const referrerRef = doc(firestore, "users", referrerDoc.id);

            // Fetch referral settings
            const settingsRef = doc(firestore, 'settings', 'referral');
            const settingsDoc = await getDoc(settingsRef);
            
            if (settingsDoc.exists()) {
                const settings = settingsDoc.data() as ReferralSettings;

                if (settings) {
                    // Add points to new user
                    newUserDoc.points = (newUserDoc.points || 0) + (settings.signupBonus || 0);
                    
                    // Create referral record
                    const referralRef = doc(collection(firestore, 'referrals'));
                    batch.set(referralRef, {
                        id: referralRef.id,
                        referrerId: referrerDoc.id,
                        refereeId: user.uid,
                        referralDate: new Date().toISOString(),
                    });
                }
            }
        }
    }
    
    batch.set(userRef, newUserDoc);
    await batch.commit();
};

function SignupFormComponent() {
    const auth = useFirebaseAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const refCode = searchParams.get('ref');
        if (refCode) {
            setReferralCode(refCode);
        }
    }, [searchParams]);

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
                await sendEmailVerification(userCredential.user);
                await saveUserAndHandleReferral(firestore, userCredential.user, referralCode, name);
                
                // Sign out the user immediately after registration
                await signOut(auth);
            }
            setIsSuccess(true);
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
            await saveUserAndHandleReferral(firestore, result.user, referralCode);
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
            <CardTitle className="text-2xl">{isSuccess ? "Verification Sent" : "Sign Up"}</CardTitle>
            <p className="text-muted-foreground mt-1">
                {isSuccess ? "Please check your email to verify your account." : "Join us and start topping up!"}
            </p>
        </div>

      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardContent className="pt-6">
          {isSuccess ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground mb-4">
                A verification email has been sent to your address. Please click the link in the email to activate your account and then log in.
              </p>
              <Button asChild className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          ) : (
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
             <div className="space-y-2">
              <Label htmlFor="referral">Referral Code (Optional)</Label>
              <Input id="referral" placeholder="Enter referral code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
            </div>
            <Button onClick={handleSignup} className="w-full text-lg h-12" disabled={isLoading || isGoogleLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Sign Up
            </Button>
          </div>
          )}

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

export default function SignupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignupFormComponent />
        </Suspense>
    );
}
