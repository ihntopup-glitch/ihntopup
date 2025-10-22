'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, Mail, Send, Loader2, MessageSquare, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WhatsAppIcon, TelegramIcon } from '@/components/icons';
import Link from 'next/link';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuthContext } from '@/contexts/AuthContext';
import { useFirestore, addDocumentNonBlocking, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { SupportTicket, SupportTicketReply } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

const getStatusBadgeVariant = (status: SupportTicket['status']) => {
  switch (status) {
    case 'Open':
      return 'bg-red-100 text-red-800';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'Closed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};


export default function SupportPage() {
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>();
  const { appUser, firebaseUser, isLoggedIn } = useAuthContext();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const ticketsQuery = useMemoFirebase(() => {
    if (!firebaseUser?.uid || !firestore) return null;
    return query(collection(firestore, 'support_tickets'), where('userId', '==', firebaseUser.uid));
  }, [firebaseUser?.uid, firestore]);
  const { data: tickets, isLoading: isLoadingTickets } = useCollection<SupportTicket>(ticketsQuery);

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
      status: 'Open' as 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
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
  
  const handleSendReply = async () => {
        if (!selectedTicket || !replyMessage || !appUser || !firestore) return;
        setIsReplying(true);

        const ticketRef = doc(firestore, 'support_tickets', selectedTicket.id);

        const newReply: SupportTicketReply = {
            message: replyMessage,
            authorName: appUser.name || 'You',
            authorId: appUser.id,
            timestamp: new Date().toISOString(),
        };

        try {
            await updateDoc(ticketRef, {
                replies: arrayUnion(newReply),
                updatedAt: new Date().toISOString(),
            });
            
            const updatedTicket = { ...selectedTicket };
            if (!updatedTicket.replies) updatedTicket.replies = [];
            updatedTicket.replies.push(newReply);
            setSelectedTicket(updatedTicket);

            setReplyMessage('');
            toast({ title: "Reply Sent" });
        } catch (error) {
            console.error("Failed to send reply:", error);
            toast({ variant: 'destructive', title: "Failed to send reply", description: "An error occurred."});
        } finally {
            setIsReplying(false);
        }
    }


  return (
    <>
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
          
           {isLoggedIn && (
            <Card>
              <CardHeader>
                <CardTitle>My Tickets</CardTitle>
                <CardDescription>View your past and ongoing support requests.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTickets ? (
                  <Loader2 className="animate-spin" />
                ) : tickets && tickets.length > 0 ? (
                  <div className='space-y-2'>
                    {tickets.map(ticket => (
                      <div key={ticket.id} className="p-3 border rounded-lg flex justify-between items-center">
                        <div>
                          <p className='font-semibold'>{ticket.subject}</p>
                           <p className="text-sm text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                        </div>
                         <div className="flex items-center gap-2">
                           <Badge variant="outline" className={getStatusBadgeVariant(ticket.status)}>
                             {ticket.status}
                           </Badge>
                           <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(ticket)}>
                             <Eye className="h-4 w-4" />
                           </Button>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center">You have no support tickets.</p>
                )}
              </CardContent>
            </Card>
           )}

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
      
       <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Ticket: {selectedTicket?.subject}</DialogTitle>
              <DialogDescription>
                Status: {selectedTicket?.status}
              </DialogDescription>
            </DialogHeader>
            {selectedTicket && (
                <div className="grid gap-4 py-4">
                     <ScrollArea className="h-[300px] w-full rounded-md border p-4 space-y-4 bg-muted/50">
                        <div className="space-y-2">
                           <p className="text-sm text-muted-foreground">Initial Request:</p>
                           <p className="text-sm p-3 bg-background rounded-lg">{selectedTicket.message}</p>
                        </div>
                        {selectedTicket.replies?.map((reply, index) => (
                             <div key={index} className={cn("flex items-start gap-3", reply.authorId === appUser?.id ? "justify-end" : "justify-start")}>
                                {reply.authorId !== appUser?.id && <Avatar className="h-8 w-8"><AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback></Avatar>}
                                <div className={cn("max-w-xs rounded-lg px-4 py-2", reply.authorId === appUser?.id ? "bg-primary text-primary-foreground" : "bg-background border")}>
                                    <p className="text-sm">{reply.message}</p>
                                    <p className={cn("text-xs mt-1", reply.authorId === appUser?.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                        {new Date(reply.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                                {reply.authorId === appUser?.id && <Avatar className="h-8 w-8"><AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback></Avatar>}
                            </div>
                        ))}
                    </ScrollArea>
                    <div className="relative">
                        <Textarea 
                            placeholder="Write your reply..." 
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="pr-12"
                            disabled={isReplying}
                        />
                         <Button 
                            type="submit" 
                            size="icon" 
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" 
                            onClick={handleSendReply}
                            disabled={isReplying || !replyMessage}
                         >
                            {isReplying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            )}
          </DialogContent>
        </Dialog>
    </>
  );
}
