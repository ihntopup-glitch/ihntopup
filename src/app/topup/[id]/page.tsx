import TopUpDetailClient from '@/components/TopUpDetailClient';
import { topUpCategories } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

export default function TopUpDetailPage({ params }: { params: { id: string } }) {
  const card = topUpCategories.flatMap(c => c.cards).find(c => c.id === params.id);

  if (!card) {
    notFound();
  }

  const category = topUpCategories.find(cat => cat.cards.some(c => c.id === card.id));

  return (
    <div className="container mx-auto px-4 py-6 fade-in">
        <Breadcrumb className="mb-6">
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbLink href="/topup">Top-Up</BreadcrumbLink>
                </BreadcrumbItem>
                {category && (
                    <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/topup">{category.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                    </>
                )}
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                <BreadcrumbPage>{card.name}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      <TopUpDetailClient card={card} />
    </div>
  );
}
