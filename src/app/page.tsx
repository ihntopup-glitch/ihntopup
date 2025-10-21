'use client';
import BannerSlider from '@/components/BannerSlider';
import NoticeBanner from '@/components/NoticeBanner';
import RecentOrders from '@/components/RecentOrders';
import TopUpCard from '@/components/TopUpCard';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { BannerData, TopUpCategory } from '@/lib/data';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const firestore = useFirestore();
  const categoriesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'categories') : null, [firestore]);
  const bannersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'banners') : null, [firestore]);

  const { data: topUpCategories, isLoading: isLoadingCategories } = useCollection<TopUpCategory>(categoriesQuery);
  const { data: banners, isLoading: isLoadingBanners } = useCollection<BannerData>(bannersQuery);

  return (
    <div className="container mx-auto px-0 sm:px-4 py-6 fade-in space-y-8">
      <NoticeBanner />
      <div className="px-4 sm:px-0">
        {isLoadingBanners ? (
          <div className="w-full aspect-[1920/791] flex items-center justify-center bg-muted rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <BannerSlider banners={banners || []} />
        )}
      </div>
      
      {isLoadingCategories ? (
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
