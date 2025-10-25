
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ProcessingLoaderProps {
  isLoading: boolean;
  message?: string;
}

export const ProcessingLoader = ({ isLoading, message = "আপনার অনুরোধটি প্রক্রিয়া করা হচ্ছে..." }: ProcessingLoaderProps) => {
  return (
    <Dialog open={isLoading}>
      <DialogContent 
        className="bg-transparent border-none shadow-none flex items-center justify-center p-0"
        hideCloseButton={true}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center p-8 bg-card rounded-2xl shadow-2xl max-w-sm w-full">
            <DialogHeader>
              <DialogTitle className="sr-only">Processing Request</DialogTitle>
            </DialogHeader>
            <div className="relative h-20 w-20">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-foreground">অনুগ্রহ করে অপেক্ষা করুন...</h3>
            <p className="text-muted-foreground">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
