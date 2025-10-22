import { Headset, ShieldCheck, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    savedGameUids?: SavedUid[];
    walletBalance?: number;
    referralCode?: string;
    isVerified?: boolean;
    isAdmin?: boolean;
    photoURL?: string;
}

export type TopUpCardData = {
  id: string;
  name: string;
  description: string;
  image: {
      src: string;
      hint: string;
  };
  price: number;
  gameUidFormat?: string;
  categoryId: string;
  options?: { name: string; price: number }[];
};

export type TopUpCategory = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  status?: 'Active' | 'Draft';
  cards?: TopUpCardData[]; // This could be a subcollection
};

export type BannerData = {
  id: string;
  imageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  alt?: string; // for accessibility
  image?: {
      src: string;
      hint: string;
  }
};

export type Order = {
  id: string;
  userId: string;
  topUpCardId: string;
  productName?: string;
  productOption?: string;
  quantity: number;
  gameUid: string;
  paymentMethod: string;
  couponId?: string;
  totalAmount: number;
  orderDate: string; // ISO 8601 format
  status: 'Pending' | 'Completed' | 'Cancelled';
};

export type WalletTransaction = {
    id: string;
    userId: string;
    type: 'credit' | 'debit';
    amount: number;
    transactionDate: string; // ISO 8601 format
    status: 'Pending' | 'Completed' | 'Failed';
    paymentMethod: string;
    description: string; 
};

export type TrustBadge = {
    icon: LucideIcon;
    title: string;
    description: string;
}

export type PaymentMethod = {
    id:string;
    name: string;
    image: {
        src: string;
        hint: string;
    };
}

export type SavedUid = {
    game: string;
    uid: string;
}

export type ReferralData = {
    referralCode: string;
    points: number;
    referredUsers: { name: string; date: string }[];
}

export type Coupon = {
    id: string;
    code: string;
    type: 'Percentage' | 'Fixed';
    value: number;
    minPurchaseAmount?: number;
    expiryDate: string;
    usageLimitPerUser?: number;
    categoryIds?: string[];
}

export type UserCoupon = {
    id: string;
    code: string;
    description: string;
}

export type SupportTicket = {
    id: string;
    userId: string;
    userEmail: string;
    subject: string;
    message: string;
    status: 'Open' | 'In Progress' | 'Closed';
    createdAt: string;
    updatedAt: string;
}
