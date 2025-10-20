import BannerSlider from '@/components/BannerSlider';
import RecentOrders from '@/components/RecentOrders';
import TopUpCard from '@/components/TopUpCard';
import TrustBadges from '@/components/TrustBadges';
import { topUpCategories, banners } from '@/lib/data';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6 fade-in space-y-8">
      <BannerSlider banners={banners} />
      
      {topUpCategories.map((category) => (
        <section key={category.id}>
          <h2 className="text-2xl font-bold font-headline mb-4 text-center">{category.name}</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {category.cards.map((card) => (
              <TopUpCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      ))}

      <TrustBadges />
      <RecentOrders />

    </div>
  );
}
