'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, Mail, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WhatsAppIcon, TelegramIcon } from '@/components/icons';
import Link from 'next/link';

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
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="space-y-2">
                  <label htmlFor="name">Full Name *</label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2 mt-4">
                  <label htmlFor="email">Email</label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
                <div className="space-y-2 mt-4">
                  <label htmlFor="message">Message</label>
                  <Textarea id="message" placeholder="How can we help you?" />
                </div>
                 <Button variant="default" size="icon" className="absolute right-4 bottom-2 h-12 w-12 rounded-full">
                    <Send className="h-6 w-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}