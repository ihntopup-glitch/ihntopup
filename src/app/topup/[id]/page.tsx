'use client';

import TopUpDetailClient from '@/components/TopUpDetailClient';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { TopUpCardData } from '@/lib/data';
import { topUpCategories } from '@/lib/data';

export default function TopUpDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<TopUpCardData | undefined>(undefined);
  
  const cardId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    setLoading(true);
    if (cardId) {
      let foundCard: TopUpCardData | undefined;
      for (const category of topUpCategories) {
        foundCard = category.cards?.find(c => c.id === cardId);
        if (foundCard) break;
      }
      
      if (foundCard) {
        setCard(foundCard);
      } else {
        notFound();
      }
    }
    setLoading(false);
  }, [cardId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-6 text-center flex justify-center items-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }
  
  if (!card) {
    return null; // Will be redirected by useEffect/notFound or show nothing while redirecting
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
