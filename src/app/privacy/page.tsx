'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto px-4 py-8 fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold font-headline">Privacy Policy</h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>গোপনীয়তা নীতি</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            IHN TOPUP আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ। এই নীতিটি ব্যাখ্যা করে যে আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি।
          </p>

          <h3 className="font-bold text-lg text-foreground pt-4">তথ্য সংগ্রহ</h3>
          <p>
            আমরা নিম্নলিখিত তথ্য সংগ্রহ করতে পারি:
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>আপনার নাম, ইমেল ঠিকানা, এবং ফোন নম্বরের মতো ব্যক্তিগত শনাক্তকরণ তথ্য।</li>
              <li>আপনার করা অর্ডারের বিবরণ, যেমন প্রোডাক্টের নাম, গেম আইডি এবং পেমেন্টের ইতিহাস।</li>
              <li>ওয়েবসাইট ব্যবহারের সময় আপনার আইপি ঠিকানা এবং ব্রাউজারের তথ্যের মতো প্রযুক্তিগত ডেটা।</li>
            </ul>
          </p>

          <h3 className="font-bold text-lg text-foreground pt-4">তথ্যের ব্যবহার</h3>
          <p>
            আপনার তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করা হয়:
             <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>আপনার অর্ডার প্রক্রিয়া এবং সম্পন্ন করতে।</li>
                <li>গ্রাহক পরিষেবা এবং সহায়তা প্রদান করতে।</li>
                <li>আমাদের পরিষেবা উন্নত করতে এবং ব্যবহারকারীর অভিজ্ঞতা ব্যক্তিগতকৃত করতে।</li>
                <li>প্রতারণা প্রতিরোধ এবং নিরাপত্তা নিশ্চিত করতে।</li>
            </ul>
          </p>

          <h3 className="font-bold text-lg text-foreground pt-4">তথ্য শেয়ারিং</h3>
          <p>
            আমরা আপনার ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রয় বা ভাড়া দিই না। তবে, আইনগত প্রয়োজনে বা আমাদের পরিষেবা প্রদানের জন্য সহায়তাকারী বিশ্বস্ত পার্টনারদের সাথে তথ্য শেয়ার করা হতে পারে।
          </p>

           <h3 className="font-bold text-lg text-foreground pt-4">আপনার অধিকার</h3>
          <p>
            আপনার ব্যক্তিগত তথ্য অ্যাক্সেস, সংশোধন বা মুছে ফেলার অধিকার আপনার রয়েছে। এই অধিকার প্রয়োগ করতে, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।
          </p>

          <p className="pt-4">
            আমাদের গোপনীয়তা নীতি সময়ে সময়ে আপডেট করা হতে পারে। যেকোনো পরিবর্তনের জন্য এই পেজটি নিয়মিত পরীক্ষা করার জন্য অনুরোধ করা হচ্ছে।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
