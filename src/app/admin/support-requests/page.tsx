'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Search,
  ListFilter,
  Eye,
  Reply,
  Loader2,
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
import { collection, query, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { SupportTicket } from '@/lib/data';


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

    const firestore = useFirestore();
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

    const handleSendReply = () => {
        if (!selectedTicket || !replyMessage) return;
        // In a real app, this would send an email or an in-app notification
        console.log(`Replying to ${selectedTicket.id}: ${replyMessage}`);
        toast({ title: "Reply Sent", description: `Your message has been sent to ${selectedTicket.userEmail}`});
        handleCloseDialog();
    }
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Support Requests</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Open</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>In Progress</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Closed</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Tickets</CardTitle>
          <CardDescription>
            View and respond to user support requests.
          </CardDescription>
           <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by subject or user..." className="pl-8 w-full" />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden sm:table-cell">Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell text-right">Date</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
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
                      {ticket.status}
                    </Badge>
                  </TableCell>
                   <TableCell className="hidden md:table-cell text-right">{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleViewDetails(ticket)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
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
              <DialogTitle>Ticket Details</DialogTitle>
              <DialogDescription>
                Ticket ID: {selectedTicket?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedTicket && (
                <div className="grid gap-4 py-4">
                    <div>
                        <h3 className="font-semibold">{selectedTicket.subject}</h3>
                        <p className="text-sm text-muted-foreground">From: {selectedTicket.userEmail}</p>
                    </div>
                    <Card className='bg-muted/50'>
                        <CardContent className='p-4 text-sm'>
                            {selectedTicket.message}
                        </CardContent>
                    </Card>
                    <Textarea 
                      placeholder={`Reply to ${selectedTicket.userEmail}...`} 
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" onClick={handleSendReply}>
                <Reply className="mr-2 h-4 w-4" /> Send Reply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}
