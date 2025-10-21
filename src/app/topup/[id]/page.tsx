'use client';

import TopUpDetailClient from '@/components/TopUpDetailClient';
import { notFound, useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { TopUpCardData } from '@/lib/data';
import { doc } from 'firebase/firestore';

export default function TopUpDetailPage() {
  const router = useRouter();
  const params = useParams();
  const firestore = useFirestore();
  
  const cardId = Array.isArray(params.id) ? params.id[0] : params.id;

  const cardDocRef = useMemoFirebase(() => {
    if (!firestore || !cardId) return null;
    return doc(firestore, 'top_up_cards', cardId);
  }, [firestore, cardId]);

  const { data: card, isLoading: loading, error } = useDoc<TopUpCardData>(cardDocRef);

  useEffect(() => {
    if (!loading && !card && cardId) {
      // After loading, if card is still not found, navigate to not-found
      // This is a client-side "not found" handling.
      notFound();
    }
  }, [loading, card, cardId]);

  if (loading) {
    return <div className="container mx-auto px-4 py-6 text-center flex justify-center items-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }
  
  if (error) {
    return <div className="container mx-auto px-4 py-6 text-center text-red-500">Error loading card data.</div>;
  }

  if (!card) {
    return null; // Will be redirected by useEffect or show nothing while redirecting
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
