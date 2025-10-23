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
import { useAuth as useFirebaseAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, User, sendEmailVerification, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Image from 'next/image';
import { handleReferral } from "@/ai/flows/handle-referral";


const saveUserToDb = async (firestore: any, user: User, name?: string) => {
    const userRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userRef);

    // If user already exists, do nothing further.
    if (userDoc.exists()) {
        return;
    }

    const newUserDocData: any = {
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
        createdAt: serverTimestamp(),
    };
    
    await setDoc(userRef, newUserDocData);
};

function SignupFormComponent() {
    const auth = useFirebaseAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSignup = async () => {
        setIsLoading(true);
        if (!auth || !firestore) {
            toast({ variant: "destructive", title: "সাইনআপ ব্যর্থ", description: "অনুমোদন পরিষেবা উপলব্ধ নেই।" });
            setIsLoading(false);
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });
                await sendEmailVerification(userCredential.user);
                await saveUserToDb(firestore, userCredential.user, name);
                
                await signOut(auth);
                setIsSuccess(true);
                toast({
                    title: "ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে",
                    description: "আপনার অ্যাকাউন্ট সক্রিয় করতে অনুগ্রহ করে আপনার ইমেল চেক করুন।",
                });
                setTimeout(() => router.push('/login'), 3000);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "সাইনআপ ব্যর্থ", description: error.message });
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        if (!auth || !firestore) {
            toast({ variant: "destructive", title: "Google লগইন ব্যর্থ", description: "অনুমোদন পরিষেবা উপলব্ধ নেই।" });
            setIsGoogleLoading(false);
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await saveUserToDb(firestore, result.user);
            toast({ title: "লগইন সফল", description: "স্বাগতম!" });
            router.push('/');
        } catch (error: any) {
            toast({ variant: "destructive", title: "Google লগইন ব্যর্থ", description: error.message });
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
            <CardTitle className="text-2xl">{isSuccess ? "ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে" : "সাইন আপ করুন"}</CardTitle>
            <p className="text-muted-foreground mt-1">
                {isSuccess ? "অনুগ্রহ করে আপনার ইমেইল চেক করে অ্যাকাউন্ট ভেরিফাই করুন।" : "আমাদের সাথে যোগ দিন এবং টপ-আপ শুরু করুন!"}
            </p>
        </div>

      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardContent className="pt-6">
          {isSuccess ? (
            <div className="text-center p-4">
              <p className="text-muted-foreground mb-4">
                আপনার ইমেইল ঠিকানায় একটি ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে। আপনার অ্যাকাউন্ট সক্রিয় করতে এবং তারপর লগইন করতে অনুগ্রহ করে লিঙ্কে ক্লিক করুন। আপনাকে শীঘ্রই লগইন পৃষ্ঠায় নিয়ে যাওয়া হবে।
              </p>
              <Button asChild className="w-full">
                <Link href="/login">লগইন পেজে যান</Link>
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
              Google দিয়ে সাইন আপ করুন
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  অথবা ইমেইল দিয়ে চালিয়ে যান
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">সম্পূর্ণ নাম</Label>
              <Input id="name" placeholder="আপনার সম্পূর্ণ নাম লিখুন" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল ঠিকানা</Label>
              <Input id="email" type="email" placeholder="আপনার ইমেইল ঠিকানা লিখুন" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input id="password" type="password" placeholder="আপনার পাসওয়ার্ড লিখুন" required value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <Button onClick={handleSignup} className="w-full text-lg h-12" disabled={isLoading || isGoogleLoading}>
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              সাইন আপ
            </Button>
          </div>
          )}

            <div className="mt-4 text-center text-sm">
                <p>
                    ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{" "}
                    <Link href="/login" className="font-bold text-green-600 hover:underline">
                        সাইন ইন করুন
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
        <Suspense fallback={<div>লোড হচ্ছে...</div>}>
            <SignupFormComponent />
        </Suspense>
    );
}
