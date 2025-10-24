'use client';

import { Headset } from 'lucide-react';
import Link from 'next/link';

export default function FloatingSupportButton() {
  return (
    <Link href="https://t.me/ihntopup_help" passHref legacyBehavior>
      <a
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 z-50 h-16 w-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-float"
        aria-label="Support Chat"
      >
        <Headset className="h-8 w-8 text-white" />
      </a>
    </Link>
  );
}
