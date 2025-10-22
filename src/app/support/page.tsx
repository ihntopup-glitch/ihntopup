'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, Mail, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WhatsAppIcon, TelegramIcon } from '@/components/icons';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type Inputs = {
  subject: string;
  message: string;
};

const ContactInfoCard = ({ icon, title, value, description, href }: { icon: React.ElementType, title: string, value: string, description: string, href: string }) => {
  const Icon = icon;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="bg-muted p-4 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-primary font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </a>
  );
};

const WorkingHoursCard = () => (
    <Card className="shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-muted p-4 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h3 className="font-semibold">Working Hours</h3>
                <div className="text-sm space-y-1 mt-1">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Friday - Sunday:</span>
                        <span className="font-medium">24 Hours</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Sunday - Thursday:</span>
                        <span className="font-medium">12 PM - 2 AM</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
)

export default function SupportPage() {
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>();
  const { appUser, firebaseUser, isLoggedIn } = useAuthContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (!isLoggedIn || !firebaseUser || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be logged in to submit a ticket.'
        });
        return;
    }
    
    setIsSubmitting(true);

    const newTicket = {
      userId: firebaseUser.uid,
      userEmail: appUser?.email || firebaseUser.email || '',
      subject: data.subject,
      message: data.message,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
        await addDocumentNonBlocking(collection(firestore, 'support_tickets'), newTicket);
        toast({
            title: 'Ticket Submitted!',
            description: 'We have received your request and will get back to you shortly.'
        });
        reset();
    } catch(error) {
        console.error("Error submitting support ticket: ", error);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'There was an error submitting your ticket. Please try again.'
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-6 fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold font-headline">Support Center</h1>
      </div>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ContactInfoCard 
                icon={Mail}
                title="Email"
                value="ihntopup@gmail.com"
                description="24/7 email support"
                href="mailto:ihntopup@gmail.com"
              />
              <ContactInfoCard 
                icon={WhatsAppIcon}
                title="WhatsApp"
                value="+880 1850822479"
                description="Quick chat support"
                href="https://wa.me/8801850822479"
              />
              <ContactInfoCard
                icon={TelegramIcon}
                title="Telegram"
                value="@ihntopup"
                description="Instant messaging support"
                href="https://t.me/ihntopup"
              />
               <div className="lg:col-span-3">
                 <WorkingHoursCard />
               </div>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="space-y-2">
                  <label htmlFor="subject">Subject *</label>
                  <Input id="subject" placeholder="What is your request about?" {...register("subject", { required: true })} />
                  {errors.subject && <p className="text-red-500 text-xs">Subject is required.</p>}
                </div>
                <div className="space-y-2 mt-4">
                  <label htmlFor="email">Your Email</label>
                  <Input id="email" type="email" placeholder="your.email@example.com" value={appUser?.email || ''} readOnly />
                </div>
                <div className="space-y-2 mt-4">
                  <label htmlFor="message">Message</label>
                  <Textarea id="message" placeholder="How can we help you?" {...register("message", { required: true })}/>
                   {errors.message && <p className="text-red-500 text-xs">Message is required.</p>}
                </div>
                 <Button type="submit" variant="default" size="icon" className="absolute right-4 bottom-2 h-12 w-12 rounded-full" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
