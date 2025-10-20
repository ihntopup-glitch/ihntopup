'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-6 fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline">Support Center</h1>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I top up my wallet?</AccordionTrigger>
              <AccordionContent>
                You can add money to your wallet by navigating to the 'Wallet' page and clicking on the 'Add Money' button. Follow the on-screen instructions to complete the process.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is my payment information secure?</AccordionTrigger>
              <AccordionContent>
                Yes, we use industry-standard encryption and security protocols to ensure that your payment information is always safe and secure.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How long does it take to receive my top-up?</AccordionTrigger>
              <AccordionContent>
                Most top-ups are processed instantly. You will receive a notification as soon as your order is completed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What is the referral program?</AccordionTrigger>
              <AccordionContent>
                Share your unique referral code with friends. When they sign up and make their first purchase, you both receive a reward in your wallet.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>If you can't find an answer, feel free to reach out.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="name">Name</label>
                    <Input id="name" placeholder="Your Name" />
                </div>
                 <div className="space-y-2">
                    <label htmlFor="email">Email</label>
                    <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
                 <div className="space-y-2">
                    <label htmlFor="message">Message</label>
                    <Textarea id="message" placeholder="How can we help you?" />
                </div>
                <Button className="w-full bg-primary hover:bg-accent">Send Message</Button>
                <div className="flex justify-center items-center gap-6 pt-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">support@ihntopup.com</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">+1 (234) 567-890</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
