'use client';

import { useState, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Notice } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Megaphone } from 'lucide-react';
import Image from 'next/image';

export default function NoticePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);
  
  const firestore = useFirestore();
  const noticeQuery = useMemoFirebase(
    () => firestore 
      ? query(
          collection(firestore, 'notices'), 
          where('status', '==', 'Active'), 
          where('type', '==', 'Popup'),
          limit(1)
        ) 
      : null,
    [firestore]
  );
  
  const { data: notices, isLoading } = useCollection<Notice>(noticeQuery);

  useEffect(() => {
    if (!isLoading && notices && notices.length > 0) {
      const noticeId = notices[0].id;
      const sessionKey = `notice_dismissed_${noticeId}`;
      const hasBeenDismissed = sessionStorage.getItem(sessionKey);

      if (hasBeenDismissed !== 'true') {
        setActiveNotice(notices[0]);
        setIsOpen(true);
      }
    }
  }, [notices, isLoading]);

  const handleDismiss = () => {
    if (activeNotice) {
      const sessionKey = `notice_dismissed_${activeNotice.id}`;
      sessionStorage.setItem(sessionKey, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen || !activeNotice) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" hideCloseButton>
        <DialogHeader className="sr-only">
          <DialogTitle>{activeNotice.title}</DialogTitle>
        </DialogHeader>
        {activeNotice.image?.src && (
           <div className="relative w-full aspect-video">
                <Image
                    src={activeNotice.image.src}
                    alt={activeNotice.title || 'Notice Image'}
                    layout="fill"
                    objectFit="cover"
                />
            </div>
        )}
        <div className="p-6 space-y-4 text-center">
            <div className="flex justify-center items-center gap-2">
                <Megaphone className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">{activeNotice.title}</h2>
            </div>
            <p className="text-muted-foreground">{activeNotice.content}</p>
             <Button onClick={handleDismiss} className="w-full">
                <X className="mr-2 h-4 w-4" />
                বন্ধ করুন
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
