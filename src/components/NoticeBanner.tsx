'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Megaphone, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NoticeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem('noticeBannerDismissed');
    if (hasBeenDismissed !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsClosing(true); // Start fade-out animation
    setTimeout(() => {
        localStorage.setItem('noticeBannerDismissed', 'true');
        setIsVisible(false);
    }, 300); // Match animation duration
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn("p-4 transition-opacity duration-300", isClosing ? "opacity-0" : "opacity-100")}>
        <Alert className="bg-blue-600 text-white border-blue-700 relative">
            <div className='flex items-start gap-3'>
                <Megaphone className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                    <AlertTitle className="font-bold text-lg">Notice</AlertTitle>
                    <AlertDescription className="text-blue-100">
                        আমাদের ওয়েবসাইটে দিনরাত ২৪ ঘন্টা অর্ডার করতে পারবেন, মাত্র ৩০ সেকেন্ডে রোবটের মাধ্যমে ডেলিভারি দেওয়া হয়।
                    </AlertDescription>
                </div>
            </div>
            <button 
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss notice"
            >
                <X className="h-4 w-4" />
            </button>
        </Alert>
    </div>
  );
}
