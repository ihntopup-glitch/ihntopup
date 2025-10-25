'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleIcon } from "@/components/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState, Suspense } from "react";
import { useAuth as useFirebaseAuth, useFirestore } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import Image from 'next/image';
import { getBengaliErrorMessage } from "@/lib/error-messages";


const saveUserToDb = async (firestore: any, user: User, name?: string) => {
    const userRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userRef);

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
    
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleGoogleSignup = async () => {
        setIsGoogleLoading(true);
        if (!auth || !firestore) {
            toast({ variant: "destructive", title: "Google সাইনআপ ব্যর্থ", description: "অনুমোদন পরিষেবা উপলব্ধ নেই।" });
            setIsGoogleLoading(false);
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            await saveUserToDb(firestore, result.user);
            toast({ title: "সাইনআপ সফল", description: `স্বাগতম, ${result.user.displayName}!` });
            router.push('/');
        } catch (error: any) {
            const errorMessage = getBengaliErrorMessage(error.code);
            toast({ variant: "destructive", title: "Google সাইনআপ ব্যর্থ", description: errorMessage });
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
            <CardTitle className="text-2xl">অ্যাকাউন্ট তৈরি করুন</CardTitle>
            <p className="text-muted-foreground mt-1">
                আমাদের সাথে যোগ দিন এবং টপ-আপ শুরু করুন!
            </p>
        </div>

      <Card className="w-full max-w-sm shadow-xl rounded-2xl">
        <CardHeader>
            <CardTitle className="text-lg">Google দিয়ে সাইন আপ করুন</CardTitle>
            <CardDescription>একটি নতুন অ্যাকাউন্ট তৈরি করার দ্রুততম এবং সবচেয়ে নিরাপদ উপায়।</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="outline" className="w-full h-12 text-base" onClick={handleGoogleSignup} disabled={isGoogleLoading}>
               {isGoogleLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-5 w-5" />
              )}
              Google দিয়ে সাইন আপ করুন
            </Button>
          </div>

            <div className="mt-6 text-center text-sm">
                <p>
                    ইতিমধ্যে একটি অ্যাকাউন্ট আছে?{" "}
                    <Link href="/login" className="font-bold text-green-600 hover:underline">
                        সাইন ইন করুন
                    </Link>
                </p>
                 <p className="mt-4 text-xs text-muted-foreground">
                    সাইন আপ করার মাধ্যমে, আপনি আমাদের <Link href="/terms" className="underline">ব্যবহারের শর্তাবলী</Link> এবং <Link href="/privacy" className="underline">গোপনীয়তা নীতিতে</Link> সম্মত হচ্ছেন।
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
