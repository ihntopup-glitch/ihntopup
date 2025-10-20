'use client';

import TopUpDetailClient from '@/components/TopUpDetailClient';
import { topUpCategories } from '@/lib/data';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function TopUpDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const foundCard = topUpCategories.flatMap(c => c.cards).find(c => c.id === params.id);
      if (foundCard) {
        setCard(foundCard);
      } else {
        notFound();
      }
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-6 text-center">Loading...</div>;
  }
  
  if (!card) {
    // notFound() must be called in the main component body or a hook, not just inside useEffect for it to work correctly during server rendering passes.
    // Since we are client rendering, we can just show a message.
     return <div className="container mx-auto px-4 py-6 text-center">Card not found.</div>;
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
