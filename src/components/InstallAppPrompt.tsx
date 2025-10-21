'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function InstallAppPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasBeenDismissed = localStorage.getItem('installPromptDismissed');
    // Only show if not dismissed and we are on a mobile device (for a better experience)
    const isMobile = /Mobi/i.test(window.navigator.userAgent);
    
    if (hasBeenDismissed !== 'true' && isMobile) {
      // Delay showing the prompt slightly
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      localStorage.setItem('installPromptDismissed', 'true');
      setIsVisible(false);
      setIsClosing(false);
    }, 300); // Corresponds to animation duration
  };

  const handleInstall = () => {
    // This is a placeholder for actual PWA installation logic.
    // In a real PWA, you would listen for the 'beforeinstallprompt' event
    // and trigger the prompt here.
    alert('To install the app, open your browser menu and select "Add to Home Screen" or "Install App".');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(
        "fixed bottom-[90px] left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-md z-50 md:hidden",
        "transition-all duration-300 ease-in-out",
        isClosing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
        isVisible ? "animate-in slide-in-from-bottom-4" : "animate-out slide-out-to-bottom-4"
        )}>
      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
            <Download className="h-6 w-6 flex-shrink-0" />
            <span className="text-sm font-semibold">Install App</span>
        </div>
        <div className='flex items-center gap-2'>
            <Button size="sm" onClick={handleInstall} className="bg-white text-blue-600 hover:bg-blue-100 h-8">
                Install
            </Button>
            <button onClick={handleDismiss} className="p-1.5 rounded-full bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </div>
      </div>
    </div>
  );
}
