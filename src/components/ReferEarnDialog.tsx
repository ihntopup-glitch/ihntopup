'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

interface ReferEarnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralCode: string;
}

export default function ReferEarnDialog({ open, onOpenChange, referralCode }: ReferEarnDialogProps) {
    const { toast } = useToast();
    const inviteLink = useMemo(() => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/signup?ref=${referralCode}`;
        }
        return `https://ihntopup.com/signup?ref=${referralCode}`;
    }, [referralCode]);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
            description: `${text} has been copied to your clipboard.`,
        });
    };
    
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join me on IHN TOPUP!',
                text: `Sign up using my referral code ${referralCode} and get exciting rewards!`,
                url: inviteLink,
            }).catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error("Share failed:", error);
                    // Fallback to copying the link if sharing fails for any reason, except user cancellation.
                    copyToClipboard(inviteLink, 'Invite Link');
                }
            });
        } else {
            // Fallback for browsers that do not support navigator.share
            copyToClipboard(inviteLink, 'Invite Link');
        }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-6 w-6 text-primary" />
            Refer & Earn
          </DialogTitle>
          <DialogDescription>
            Share your code with friends. When they make their first purchase, you both get rewarded!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div>
                <Label htmlFor="referral-code">Your Referral Code</Label>
                <div className="flex items-center gap-2 mt-1">
                    <Input id="referral-code" value={referralCode} readOnly className="font-mono bg-muted"/>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode, 'Referral Code')}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div>
                <Label htmlFor="invite-link">Your Invite Link</Label>
                 <div className="flex items-center gap-2 mt-1">
                    <Input id="invite-link" value={inviteLink} readOnly className="text-xs bg-muted"/>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(inviteLink, 'Invite Link')}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
        <Button onClick={handleShare} className="w-full">
            <Share2 className="mr-2 h-4 w-4" />
            Share with Friends
        </Button>
      </DialogContent>
    </Dialog>
  );
}
