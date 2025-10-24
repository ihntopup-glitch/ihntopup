'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WhatsAppIcon, TelegramIcon } from '@/components/icons';


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
                <h3 className="font-semibold">কার্যক্রমের সময়</h3>
                <div className="text-sm space-y-1 mt-1">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">শুক্রবার - রবিবার:</span>
                        <span className="font-medium">২৪ ঘন্টা</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">রবিবার - বৃহস্পতিবার:</span>
                        <span className="font-medium">দুপুর ১২টা - রাত ২টা</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
)

export default function SupportPage() {
  const router = useRouter();

  return (
    <>
      <div className="container mx-auto px-4 py-6 fade-in">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold font-headline">সাপোর্ট কেন্দ্র</h1>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">যোগাযোগের তথ্য</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ContactInfoCard 
                  icon={Mail}
                  title="ইমেইল"
                  value="ihntopup@gmail.com"
                  description="২৪/৭ ইমেইল সাপোর্ট"
                  href="mailto:ihntopup@gmail.com"
                />
                <ContactInfoCard 
                  icon={WhatsAppIcon}
                  title="WhatsApp"
                  value="+880 1850822479"
                  description="দ্রুত চ্যাট সাপোর্ট"
                  href="https://wa.me/8801850822479"
                />
                <ContactInfoCard
                  icon={TelegramIcon}
                  title="Telegram"
                  value="@ihntopup"
                  description="ইনস্ট্যান্ট মেসেজিং সাপোর্ট"
                  href="https://t.me/ihntopup"
                />
                <ContactInfoCard
                  icon={TelegramIcon}
                  title="Telegram Group"
                  value="Join Group"
                  description="আমাদের কমিউনিটিতে যোগ দিন"
                  href="https://t.me/+a_5Yv3d-3s4yMjJl"
                />
                 <div className="lg:col-span-3">
                   <WorkingHoursCard />
                 </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
