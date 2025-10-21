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

export const banners: BannerData[] = [
  { id: '1', imageUrl: 'https://picsum.photos/seed/banner1/1920/791', linkUrl: '#', startDate: '', endDate: '', isActive: true, alt: 'Special Offer', image: { src: 'https://picsum.photos/seed/banner1/1920/791', hint: 'promotion offer' } },
  { id: '2', imageUrl: 'https://picsum.photos/seed/banner2/1920/791', linkUrl: '#', startDate: '', endDate: '', isActive: true, alt: 'New Arrivals', image: { src: 'https://picsum.photos/seed/banner2/1920/791', hint: 'new arrival' } },
  { id: '3', imageUrl: 'https://picsum.photos/seed/banner3/1920/791', linkUrl: '#', startDate: '', endDate: '', isActive: true, alt: 'Seasonal Sale', image: { src: 'https://picsum.photos/seed/banner3/1920/791', hint: 'seasonal sale' } },
];

export const topUpCategories: TopUpCategory[] = [
  {
    id: 'gaming',
    name: 'Gaming',
    cards: [
      { id: 'pubg', categoryId: 'gaming', name: 'PUBG Mobile', price: 9.99, image: { src: 'https://picsum.photos/seed/pubg/400/400', hint: 'gaming currency'}, description: 'Get PUBG Mobile Unknown Cash (UC) to purchase in-game items.', options: [{name: '600 UC', price: 9.99}, {name: '1800 UC', price: 29.99}, {name: '3850 UC', price: 49.99}] },
      { id: 'freefire', categoryId: 'gaming', name: 'Free Fire', price: 9.99, image: { src: 'https://picsum.photos/seed/freefire/400/400', hint: 'gaming currency'}, description: 'Top up Free Fire Diamonds to buy weapons, skins, and more.', options: [{name: '1080 Diamonds', price: 9.99}, {name: 'Weekly Pass', price: 1.99}, {name: 'Monthly Pass', price: 7.99}] },
      { id: 'codm', categoryId: 'gaming', name: 'Call of Duty: Mobile', price: 19.99, image: { src: 'https://picsum.photos/seed/codm/400/400', hint: 'gaming action'}, description: 'Purchase COD Points for use in Call of Duty: Mobile.' },
      { id: 'valorant', categoryId: 'gaming', name: 'Valorant', price: 19.99, image: { src: 'https://picsum.photos/seed/valorant/400/400', hint: 'gaming shooter'}, description: 'Get Valorant Points for the tactical shooter from Riot Games.' },
      { id: 'genshin', categoryId: 'gaming', name: 'Genshin Impact', price: 4.99, image: { src: 'https://picsum.photos/seed/genshin/400/400', hint: 'gaming anime'}, description: 'Top up Genesis Crystals for wishes and more in Genshin Impact.' },
       { id: 'roblox', categoryId: 'gaming', name: 'Roblox', price: 10.00, image: { src: 'https://picsum.photos/seed/roblox/400/400', hint: 'gaming creative'}, description: 'Get Robux to customize your avatar and access premium content.' },
    ],
  },
  {
    id: 'streaming',
    name: 'Streaming',
    cards: [
      { id: 'netflix', categoryId: 'streaming', name: 'Netflix', price: 15.49, image: { src: 'https://picsum.photos/seed/netflix/400/400', hint: 'streaming subscription'}, description: 'Enjoy unlimited movies and TV shows with a Netflix subscription.' },
      { id: 'spotify', categoryId: 'streaming', name: 'Spotify', price: 9.99, image: { src: 'https://picsum.photos/seed/spotify/400/400', hint: 'music streaming'}, description: 'Listen to your favorite music ad-free with Spotify Premium.' },
    ],
  },
  {
    id: 'gift-cards',
    name: 'Gift Cards',
    cards: [
        { id: 'itunes', categoryId: 'gift-cards', name: 'iTunes', price: 10.00, image: { src: 'https://picsum.photos/seed/itunes/400/400', hint: 'app store'}, description: 'Perfect for apps, games, music, and more on the App Store.' },
        { id: 'googleplay', categoryId: 'gift-cards', name: 'Google Play', price: 10.00, image: { src: 'https://picsum.photos/seed/googleplay/400/400', hint: 'app store'}, description: 'The gift of games, apps, and more, for use on the Google Play Store.' },
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
  { id: 'ORD-003', orderDate: '2024-07-28', topUpCardId: 'Free Fire 1080 Diamonds', totalAmount: 9.99, status: 'Pending', userId: 'Rahi', quantity: 1, gameUid: '54321', paymentMethod: 'bKash' },
  { id: 'ORD-004', orderDate: '2024-07-29', topUpCardId: 'Spotify Premium', totalAmount: 9.99, status: 'Cancelled', userId: 'Test User', quantity: 1, gameUid: 'N/A', paymentMethod: 'Wallet' },

];

export const userProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 555-123-4567',
  isVerified: true,
  referralCode: 'A7B2C9X4',
  photoURL: 'https://picsum.photos/seed/user-avatar/200/200',
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
    { id: 'bkash', name: 'bKash', image: { src: '/images/bkash.png', hint: 'payment logo' } },
    { id: 'nagad', name: 'Nagad', image: { src: '/images/nagad.png', hint: 'payment logo' } },
    { id: 'rocket', name: 'Rocket', image: { src: '/images/rocket.png', hint: 'payment logo' } },
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

export const userCoupons: UserCoupon[] = [];
