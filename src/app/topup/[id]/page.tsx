'use client';

import TopUpDetailClient from '@/components/TopUpDetailClient';
import { topUpCategories } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TopUpDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const card = topUpCategories.flatMap(c => c.cards).find(c => c.id === params.id);

  if (!card) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-6 fade-in">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <TopUpDetailClient card={card} />
    </div>
  );
}
