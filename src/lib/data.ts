import { Headset, ShieldCheck, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import data from './placeholder-images.json';

const getImage = (id: string) => data.placeholderImages.find(img => img.id === id);

export type TopUpCardData = {
  id: string;
  name: string;
  price: number;
  image: {
    src: string;
    hint: string;
  };
  description: string;
  options?: { name: string; price: number }[];
};

export type TopUpCategory = {
  id: string;
  name: string;
  cards: TopUpCardData[];
};

export type BannerData = {
  id: string;
  image: {
    src: string;
    hint: string;
  };
  alt: string;
};

export type Order = {
  id: string;
  date: string;
  items: string;
  total: number;
  status: 'Pending' | 'Completed' | 'Cancelled';
  user: string;
};

export type WalletTransaction = {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
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

export const banners: BannerData[] = [
  { id: '1', image: { src: getImage('banner-1')?.imageUrl!, hint: getImage('banner-1')?.imageHint! }, alt: 'Special Offer' },
  { id: '2', image: { src: getImage('banner-2')?.imageUrl!, hint: getImage('banner-2')?.imageHint! }, alt: 'New Arrivals' },
  { id: '3', image: { src: getImage('banner-3')?.imageUrl!, hint: getImage('banner-3')?.imageHint! }, alt: 'Seasonal Sale' },
];

export const topUpCategories: TopUpCategory[] = [
  {
    id: 'gaming',
    name: 'Gaming',
    cards: [
      { id: 'pubg', name: 'PUBG Mobile', price: 9.99, image: { src: getImage('card-pubg')?.imageUrl!, hint: getImage('card-pubg')?.imageHint! }, description: 'Get PUBG Mobile Unknown Cash (UC) to purchase in-game items.', options: [{name: '600 UC', price: 9.99}, {name: '1800 UC', price: 29.99}, {name: '3850 UC', price: 49.99}] },
      { id: 'freefire', name: 'Free Fire', price: 9.99, image: { src: getImage('card-freefire')?.imageUrl!, hint: getImage('card-freefire')?.imageHint! }, description: 'Top up Free Fire Diamonds to buy weapons, skins, and more.', options: [{name: '1080 Diamonds', price: 9.99}, {name: 'Weekly Pass', price: 1.99}, {name: 'Monthly Pass', price: 7.99}] },
    ],
  },
  {
    id: 'streaming',
    name: 'Streaming',
    cards: [
      { id: 'netflix', name: 'Netflix', price: 15.49, image: { src: getImage('card-netflix')?.imageUrl!, hint: getImage('card-netflix')?.imageHint! }, description: 'Enjoy unlimited movies and TV shows with a Netflix subscription.' },
      { id: 'spotify', name: 'Spotify', price: 9.99, image: { src: getImage('card-spotify')?.imageUrl!, hint: getImage('card-spotify')?.imageHint! }, description: 'Listen to your favorite music ad-free with Spotify Premium.' },
    ],
  },
  {
    id: 'gift-cards',
    name: 'Gift Cards',
    cards: [
        { id: 'itunes', name: 'iTunes', price: 10.00, image: { src: getImage('card-itunes')?.imageUrl!, hint: getImage('card-itunes')?.imageHint! }, description: 'Perfect for apps, games, music, and more on the App Store.' },
        { id: 'googleplay', name: 'Google Play', price: 10.00, image: { src: getImage('card-googleplay')?.imageUrl!, hint: getImage('card-googleplay')?.imageHint! }, description: 'The gift of games, apps, and more, for use on the Google Play Store.' },
    ],
  }
];

export const walletData = {
    balance: 125.50,
    transactions: [
        { id: 'txn1', date: '2024-07-28', description: 'Added to wallet', amount: 50.00, type: 'credit' },
        { id: 'txn2', date: '2024-07-27', description: 'Netflix Purchase', amount: -15.49, type: 'debit' },
        { id: 'txn3', date: '2024-07-25', description: 'Referral Bonus', amount: 5.00, type: 'credit' },
        { id: 'txn4', date: '2024-07-22', description: 'PUBG UC Purchase', amount: -9.99, type: 'debit' },
    ] as WalletTransaction[],
};

export const orders: Order[] = [
  { id: 'ORD-001', date: '2024-07-27', items: 'Netflix 1 Month Standard', total: 15.49, status: 'Completed', user: 'SHIMON YT' },
  { id: 'ORD-002', date: '2024-07-22', items: 'PUBG 600 UC', total: 9.99, status: 'Completed', user: 'Ee Ss' },
  { id: 'ORD-003', date: '2024-08-01', items: 'Spotify 1 Month Premium', total: 9.99, status: 'Completed', user: 'SHAKILツ' },
  { id: 'ORD-004', date: '2024-07-20', items: 'Free Fire Diamonds', total: 9.99, status: 'Completed', user: 'Ismail Isnail' },
  { id: 'ORD-005', date: '2024-08-02', items: 'iTunes $10 Gift Card', total: 10.00, status: 'Completed', user: 'mr Habib' },
  { id: 'ORD-006', date: '2024-08-03', items: 'Free Fire Weekly Pass', total: 1.99, status: 'Completed', user: 'Farhad R Shohan' },
  { id: 'ORD-007', date: '2024-07-29', items: 'Google Play $10 Gift Card', total: 10.00, status: 'Completed', user: 'John Doe' },
  { id: 'ORD-008', date: '2024-07-15', items: 'Netflix 1 Month Standard', total: 15.49, status: 'Cancelled', user: 'Jane Smith' },
  { id: 'ORD-009', date: '2024-08-04', items: 'Spotify 1 Month Premium', total: 9.99, status: 'Pending', user: 'Alex Ray' },
  { id: 'ORD-010', date: '2024-08-05', items: 'PUBG 1800 UC', total: 29.99, status: 'Pending', user: 'Mia Wong' },
  { id: 'ORD-011', date: '2024-08-05', items: 'Free Fire Monthly Pass', total: 7.99, status: 'Completed', user: 'Chris Green' },
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
