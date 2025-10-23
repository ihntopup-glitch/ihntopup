'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Search,
  ListFilter,
  Eye,
  Reply,
  Loader2,
  Send,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { SupportTicket } from '@/lib/data';
import { useAuthContext } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';


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

export default function SupportRequestsPage() {
    const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);
    const [replyMessage, setReplyMessage] = React.useState('');
    const [isReplying, setIsReplying] = React.useState(false);

    const firestore = useFirestore();
    const { appUser } = useAuthContext();
    const { toast } = useToast();
    const ticketsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'support_tickets')) : null, [firestore]);
    const { data: tickets, isLoading } = useCollection<SupportTicket>(ticketsQuery);

    const handleViewDetails = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setReplyMessage('');
    };

    const handleCloseDialog = () => {
        setSelectedTicket(null);
    };

    const handleSendReply = async () => {
        if (!selectedTicket || !replyMessage || !appUser || !firestore) return;
        setIsReplying(true);

        const ticketRef = doc(firestore, 'support_tickets', selectedTicket.id);

        const newReply = {
            message: replyMessage,
            authorName: appUser.name || 'Admin',
            authorId: appUser.id,
            timestamp: new Date().toISOString(),
        };

        try {
            await updateDoc(ticketRef, {
                replies: arrayUnion(newReply),
                status: 'In Progress',
                updatedAt: new Date().toISOString(),
            });
            
            // This is optimistic update for UI
            const updatedTicket = { ...selectedTicket };
            if (!updatedTicket.replies) updatedTicket.replies = [];
            updatedTicket.replies.push(newReply);
            updatedTicket.status = 'In Progress';
            setSelectedTicket(updatedTicket);

            setReplyMessage('');
            toast({ title: "উত্তর পাঠানো হয়েছে", description: `আপনার বার্তাটি ${selectedTicket.userEmail}-কে পাঠানো হয়েছে`});
        } catch (error) {
            console.error("Failed to send reply:", error);
            toast({ variant: 'destructive', title: "উত্তর পাঠাতে ব্যর্থ", description: "একটি ত্রুটি ঘটেছে।"});
        } finally {
            setIsReplying(false);
        }
    }
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">সাপোর্ট অনুরোধ</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    ফিল্টার
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>স্ট্যাটাস দিয়ে ফিল্টার করুন</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>খোলা</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>চলমান</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>বন্ধ</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>টিকেট ম্যানেজ করুন</CardTitle>
          <CardDescription>
            ব্যবহারকারীদের সাপোর্ট অনুরোধ দেখুন এবং উত্তর দিন।
          </CardDescription>
           <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="বিষয় বা ব্যবহারকারী দিয়ে খুঁজুন..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ব্যবহারকারী</TableHead>
                <TableHead className="hidden sm:table-cell">বিষয়</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead className="hidden md:table-cell text-right">শেষ আপডেট</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">একশন</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets?.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                      <div className="font-medium">{ticket.userEmail}</div>
                      <div className="text-sm text-muted-foreground md:hidden truncate max-w-[200px]">
                          {ticket.subject}
                      </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell truncate max-w-xs">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeVariant(ticket.status)}>
                      {ticket.status === 'Open' ? 'খোলা' : ticket.status === 'In Progress' ? 'চলমান' : 'বন্ধ'}
                    </Badge>
                  </TableCell>
                   <TableCell className="hidden md:table-cell text-right">{new Date(ticket.updatedAt).toLocaleString()}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">মেনু</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>একশন</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleViewDetails(ticket)}>
                            <Eye className="mr-2 h-4 w-4" />
                            দেখুন ও উত্তর দিন
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>টিকেট: {selectedTicket?.subject}</DialogTitle>
              <DialogDescription>
                প্রেরক: {selectedTicket?.userEmail} | স্ট্যাটাস: {selectedTicket?.status === 'Open' ? 'খোলা' : selectedTicket?.status === 'In Progress' ? 'চলমান' : 'বন্ধ'}
              </DialogDescription>
            </DialogHeader>
            {selectedTicket && (
                <div className="grid gap-4 py-4">
                     <ScrollArea className="h-[300px] w-full rounded-md border p-4 space-y-4 bg-muted/50">
                        <div className="space-y-2">
                           <p className="text-sm text-muted-foreground">প্রাথমিক অনুরোধ:</p>
                           <p className="text-sm p-3 bg-background rounded-lg">{selectedTicket.message}</p>
                        </div>
                        {selectedTicket.replies?.map((reply, index) => (
                             <div key={index} className={cn("flex items-start gap-3", reply.authorId === appUser?.id ? "justify-end" : "justify-start")}>
                                {reply.authorId !== appUser?.id && <Avatar className="h-8 w-8"><AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback></Avatar>}
                                <div className={cn("max-w-xs rounded-lg px-4 py-2", reply.authorId === appUser?.id ? "bg-primary text-primary-foreground" : "bg-background")}>
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
                            placeholder={`${selectedTicket.userEmail}-কে উত্তর দিন...`} 
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
