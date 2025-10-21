import { Headset, ShieldCheck, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import data from './placeholder-images.json';

const getImage = (id: string) => data.placeholderImages.find(img => img.id === id);

export type User = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    savedGameUids?: SavedUid[];
    walletBalance?: number;
    referralCode?: string;
    isVerified?: boolean;
    photoURL?: string;
}

export type TopUpCardData = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
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
    description: string; // Added from original implementation for UI
    date: string; // Added from original implementation for UI
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
    title: string;
    description: string;
    pointsRequired: number;
}

export type UserCoupon = {
    id: string;
    code: string;
    description: string;
}


// --- Mock Data ---
// This data will be replaced by Firestore data

export const banners: BannerData[] = [
  { id: '1', imageUrl: getImage('banner-1')?.imageUrl!, linkUrl: '#', startDate: '', endDate: '', isActive: true, alt: 'Special Offer', image: { src: getImage('banner-1')?.imageUrl!, hint: getImage('banner-1')?.imageHint! } },
  { id: '2', imageUrl: getImage('banner-2')?.imageUrl!, linkUrl: '#', startDate: '', endDate: '', isActive: true, alt: 'New Arrivals', image: { src: getImage('banner-2')?.imageUrl!, hint: getImage('banner-2')?.imageHint! } },
  { id: '3', imageUrl: getImage('banner-3')?.imageUrl!, linkUrl: '#', startDate: '', endDate: '', isActive: true, alt: 'Seasonal Sale', image: { src: getImage('banner-3')?.imageUrl!, hint: getImage('banner-3')?.imageHint! } },
];

export const topUpCategories: TopUpCategory[] = [
  {
    id: 'gaming',
    name: 'Gaming',
    cards: [
      { id: 'pubg', categoryId: 'gaming', name: 'PUBG Mobile', price: 9.99, imageUrl: getImage('card-pubg')?.imageUrl!, description: 'Get PUBG Mobile Unknown Cash (UC) to purchase in-game items.', options: [{name: '600 UC', price: 9.99}, {name: '1800 UC', price: 29.99}, {name: '3850 UC', price: 49.99}] },
      { id: 'freefire', categoryId: 'gaming', name: 'Free Fire', price: 9.99, imageUrl: getImage('card-freefire')?.imageUrl!, description: 'Top up Free Fire Diamonds to buy weapons, skins, and more.', options: [{name: '1080 Diamonds', price: 9.99}, {name: 'Weekly Pass', price: 1.99}, {name: 'Monthly Pass', price: 7.99}] },
    ],
  },
  {
    id: 'streaming',
    name: 'Streaming',
    cards: [
      { id: 'netflix', categoryId: 'streaming', name: 'Netflix', price: 15.49, imageUrl: getImage('card-netflix')?.imageUrl!, description: 'Enjoy unlimited movies and TV shows with a Netflix subscription.' },
      { id: 'spotify', categoryId: 'streaming', name: 'Spotify', price: 9.99, imageUrl: getImage('card-spotify')?.imageUrl!, description: 'Listen to your favorite music ad-free with Spotify Premium.' },
    ],
  },
  {
    id: 'gift-cards',
    name: 'Gift Cards',
    cards: [
        { id: 'itunes', categoryId: 'gift-cards', name: 'iTunes', price: 10.00, imageUrl: getImage('card-itunes')?.imageUrl!, description: 'Perfect for apps, games, music, and more on the App Store.' },
        { id: 'googleplay', categoryId: 'gift-cards', name: 'Google Play', price: 10.00, imageUrl: getImage('card-googleplay')?.imageUrl!, description: 'The gift of games, apps, and more, for use on the Google Play Store.' },
    ],
  }
];

export const walletData = {
    balance: 125.50,
    transactions: [
        { id: 'txn1', date: '2024-07-28', description: 'Added to wallet', amount: 50.00, type: 'credit', userId: 'mock', transactionDate: '', status: 'Completed', paymentMethod: 'bKash' },
        { id: 'txn2', date: '2024-07-27', description: 'Netflix Purchase', amount: -15.49, type: 'debit', userId: 'mock', transactionDate: '', status: 'Completed', paymentMethod: 'Wallet' },
        { id: 'txn3', date: '2024-07-25', description: 'Referral Bonus', amount: 5.00, type: 'credit', userId: 'mock', transactionDate: '', status: 'Completed', paymentMethod: 'System' },
        { id: 'txn4', date: '2024-07-22', description: 'PUBG UC Purchase', amount: -9.99, type: 'debit', userId: 'mock', transactionDate: '', status: 'Completed', paymentMethod: 'Wallet' },
    ] as WalletTransaction[],
};

export const orders: Order[] = [
  { id: 'ORD-001', orderDate: '2024-07-27', topUpCardId: 'Netflix 1 Month Standard', totalAmount: 15.49, status: 'Completed', userId: 'SHIMON YT', quantity: 1, gameUid: 'N/A', paymentMethod: 'Wallet' },
  { id: 'ORD-002', orderDate: '2024-07-22', topUpCardId: 'PUBG 600 UC', totalAmount: 9.99, status: 'Completed', userId: 'Ee Ss', quantity: 1, gameUid: '12345', paymentMethod: 'Wallet' },
];

export const userProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 555-123-4567',
  isVerified: true,
  referralCode: 'A7B2C9X4',
  avatar: {
    src: getImage('user-avatar')?.imageUrl!,
    hint: getImage('user-avatar')?.imageHint!
  },
  savedUids: [
    { game: 'Free Fire', uid: '1234567890' },
    { game: 'PUBG Mobile', uid: '0987654321' },
  ] as SavedUid[],
};

export const trustBadges: TrustBadge[] = [
    { icon: ShieldCheck, title: 'Secure Payment', description: '100% secure and encrypted payments.' },
    { icon: Truck, title: 'Fast Delivery', description: 'Instant delivery of your digital goods.' },
    { icon: Headset, title: '24/7 Support', description: 'Get help anytime, day or night.' },
];

export const paymentMethods: PaymentMethod[] = [
    { id: 'bkash', name: 'bKash', image: { src: getImage('payment-bkash')?.imageUrl!, hint: getImage('payment-bkash')?.imageHint! } },
    { id: 'nagad', name: 'Nagad', image: { src: getImage('payment-nagad')?.imageUrl!, hint: getImage('payment-nagad')?.imageHint! } },
    { id: 'rocket', name: 'Rocket', image: { src: getImage('payment-rocket')?.imageUrl!, hint: getImage('payment-rocket')?.imageHint! } },
];

export const referralData: ReferralData = {
    referralCode: 'A7B2C9X4',
    points: 2500,
    referredUsers: [
        { name: 'Alice', date: '2024-08-01' },
        { name: 'Bob', date: '2024-08-03' },
        { name: 'Charlie', date: '2024-08-05' },
    ]
};

export const availableCoupons: Coupon[] = [
    { id: 'CPN001', title: '5% Off Coupon', description: 'Get 5% off on your next purchase.', pointsRequired: 1000 },
    { id: 'CPN002', title: '10% Off Coupon', description: 'Get 10% off on your next purchase.', pointsRequired: 1800 },
    { id: 'CPN003', title: '৳50 Flat Discount', description: 'Get a flat ৳50 discount.', pointsRequired: 2500 },
];

export const userCoupons: UserCoupon[] = [
    { id: 'UC1', code: 'WELCOME10', description: '10% off on your first order' },
    { id: 'UC2', code: 'FLAT20', description: 'Flat ৳20 discount' },
];
