import { Headset, ShieldCheck, Truck, Star } from 'lucide-react';
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
    points?: number;
    createdAt?: any;
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
  serviceType?: 'Game' | 'Others';
  gameUidFormat?: string;
  categoryId: string;
  isActive: boolean;
  sortOrder?: number;
  options?: { name: string; price: number; inStock?: boolean }[];
};

export type TopUpCategory = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  status?: 'Active' | 'Draft';
  cards?: TopUpCardData[]; // This could be a subcollection
  sortOrder?: number;
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
  userName: string;
  topUpCardId: string;
  productName?: string;
  productOption?: string;
  quantity: number;
  gameUid: string;
  paymentMethod: string;
  couponId?: string | null;
  totalAmount: number;
  orderDate: string; // ISO 8601 format
  status: 'Pending' | 'Completed' | 'Cancelled';
  cancellationReason?: string;
  manualPaymentDetails?: {
    senderPhone: string;
    transactionId: string;
    method: string;
  };
};

export type WalletTopUpRequest = {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  approvedAmount?: number;
  senderPhone: string;
  transactionId: string;
  method: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
}

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
    accountNumber: string;
    accountType: string;
    instructions?: string;
}

export type SavedUid = {
    game: string;
    uid: string;
}

export type Referral = {
  id: string;
  referrerId: string;
  refereeId: string;
  referralDate: string;
  bonusEarnedReferrer?: number;
  bonusEarnedReferee?: number;
  isFirstOrderComplete?: boolean;
};


export type ReferralSettings = {
  id: string; // Should be a singleton document id like 'default'
  signupBonus: number;
  referrerBonus: number;
  firstOrderBonus: number;
  purchaseBonusTiers: { threshold: number; bonus: number }[];
};


export type Coupon = {
    id: string;
    name: string;
    code: string;
    type: 'Percentage' | 'Fixed';
    value: number;
    minPurchaseAmount?: number;
    expiryDate?: string;
    usageLimitPerUser?: number;
    totalUsageLimit?: number;
    categoryIds?: string[];
    isActive: boolean;
    isStoreVisible?: boolean;
    claimLimit?: number;
    claimedCount: number;
}

export type UserCoupon = {
    id: string;
    code: string;
    description: string;
    acquiredDate: string;
}

export type SupportTicketReply = {
    authorId: string;
    authorName: string;
    message: string;
    timestamp: string;
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
    replies?: SupportTicketReply[];
}

export type PaymentSettings = {
    mode: 'manual' | 'automatic';
};

export type Notice = {
    id: string;
    title: string;
    content: string;
    image?: {
        src: string;
        hint: string;
    };
    type: 'Info' | 'Popup';
    status: 'Active' | 'Inactive';
}

    
    
    