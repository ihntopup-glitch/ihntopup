'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TermsAndConditionsPage() {
    const router = useRouter();
  return (
    <div className="container mx-auto px-4 py-8 fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold font-headline">Terms & Conditions</h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>শর্তাবলী</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            IHN TOPUP ওয়েবসাইটে আপনাকে স্বাগতম। এই ওয়েবসাইট ব্যবহার করার আগে, অনুগ্রহ করে নিম্নলিখিত শর্তাবলী মনোযোগ সহকারে পড়ুন। আমাদের পরিষেবা ব্যবহার করে, আপনি এই শর্তাবলীতে সম্মত হচ্ছেন বলে ধরে নেওয়া হবে।
          </p>

          <h3 className="font-bold text-lg text-foreground pt-4">১. অ্যাকাউন্ট এবং নিরাপত্তা</h3>
          <p>
            আপনাকে আমাদের পরিষেবাগুলো ব্যবহার করার জন্য একটি অ্যাকাউন্ট তৈরি করতে হতে পারে। আপনার অ্যাকাউন্টের তথ্যের গোপনীয়তা রক্ষা করার দায়িত্ব আপনার। আপনার অ্যাকাউন্ট থেকে করা সমস্ত কার্যকলাপের জন্য আপনি দায়ী থাকবেন।
          </p>

          <h3 className="font-bold text-lg text-foreground pt-4">২. অর্ডার এবং পেমেন্ট</h3>
          <p>
            সমস্ত টপ-আপ এবং ডিজিটাল কার্ডের মূল্য ওয়েবসাইটে উল্লেখ করা আছে। আমরা যেকোনো সময় মূল্য পরিবর্তন করার অধিকার রাখি। পেমেন্ট সম্পন্ন হওয়ার পরেই আপনার অর্ডার প্রক্রিয়া করা হবে। ভুল গেম আইডি বা তথ্য প্রদানের জন্য আমরা দায়ী থাকব না।
          </p>

          <h3 className="font-bold text-lg text-foreground pt-4">৩. রিফান্ড নীতি</h3>
          <p>
            যেহেতু আমাদের পণ্যগুলো ডিজিটাল, তাই সাধারণত কোনো রিফান্ডের সুযোগ নেই। যদি আমাদের সিস্টেমের ত্রুটির কারণে আপনার অর্ডার ব্যর্থ হয়, তবে আমরা সম্পূর্ণ রিফান্ড প্রদান করব।
          </p>

          <h3 className="font-bold text-lg text-foreground pt-4">৪. পরিষেবার সীমাবদ্ধতা</h3>
          <p>
            আমরা কোনো প্রকার গ্যারান্টি দিই না যে আমাদের পরিষেবা সব সময় নিরবচ্ছিন্ন বা ত্রুটিমুক্ত থাকবে। আমরা যেকোনো সময় কোনো পূর্ব ঘোষণা ছাড়াই পরিষেবা পরিবর্তন বা বন্ধ করার অধিকার রাখি।
          </p>

          <p className="pt-4">
            এই শর্তাবলী সময়ে সময়ে আপডেট করা হতে পারে। যেকোনো পরিবর্তনের জন্য এই পেজটি নিয়মিত পরীক্ষা করার জন্য আপনাকে অনুরোধ করা হচ্ছে।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
