import type { Metadata } from 'next';
import './globals.css';
import AppLayout from '@/components/AppLayout';


export const metadata: Metadata = {
  title: 'IHN TOPUP',
  description: 'Instant top-ups and digital cards.',
  icons: {
    icon: 'https://i.imgur.com/bJH9BH5.png',
    shortcut: 'https://i.imgur.com/bJH9BH5.png',
    apple: 'https://i.imgur.com/bJH9BH5.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppLayout>{children}</AppLayout>;
}
