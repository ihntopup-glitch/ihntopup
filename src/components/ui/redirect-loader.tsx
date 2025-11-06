
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface RedirectLoaderProps {
  isLoading: boolean;
  title?: string;
  message?: string;
}

export const RedirectLoader = ({ isLoading, title = "Redirecting to Payment...", message = "Please wait while we redirect you to the payment gateway" }: RedirectLoaderProps) => {
  return (
    <Dialog open={isLoading}>
      <DialogContent 
        className="bg-white border-none shadow-none flex items-center justify-center p-0 rounded-lg"
        hideCloseButton={true}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center p-8 bg-card rounded-lg shadow-2xl max-w-sm w-full">
            <DialogHeader>
              <DialogTitle className="sr-only">{title}</DialogTitle>
            </DialogHeader>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-muted-foreground">{message}</p>
            <div className="relative h-12 w-12 mt-2">
                <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
