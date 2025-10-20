import TopUpCard from '@/components/TopUpCard';
import { topUpCategories } from '@/lib/data';

export default function TopUpPage() {
  return (
    <div className="container mx-auto px-4 py-6 fade-in">
       <h1 className="text-3xl font-bold font-headline mb-6">Browse Top-Ups</h1>
      <div className="space-y-8">
        {topUpCategories.map((category) => (
          <section key={category.id}>
            <h2 className="text-2xl font-bold font-headline mb-4">{category.name}</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
              {category.cards.map((card) => (
                <TopUpCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
