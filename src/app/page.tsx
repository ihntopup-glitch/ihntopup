'use client';
import BannerSlider from '@/components/BannerSlider';
import NoticeBanner from '@/components/NoticeBanner';
import RecentOrders from '@/components/RecentOrders';
import TopUpCard from '@/components/TopUpCard';
import { banners, topUpCategories } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto px-0 sm:px-4 py-6 fade-in space-y-8">
      <NoticeBanner />
      <div className="px-4 sm:px-0">
        {isLoading ? (
          <div className="w-full aspect-[1920/791] flex items-center justify-center bg-muted rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <BannerSlider banners={banners || []} />
        )}
      </div>
      
      {isLoading ? (
         <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      ) : (
        topUpCategories?.map((category) => (
          <section key={category.id} className="px-4 sm:px-0">
            <h2 className="text-2xl font-bold font-headline mb-4 text-center">{category.name}</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {category.cards?.map((card) => (
                <TopUpCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        ))
      )}

      <div className="px-4 sm:px-0">
        <RecentOrders />
      </div>

    </div>
  );
}
