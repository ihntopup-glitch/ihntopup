import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import type { TopUpCardData } from '@/lib/data';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface TopUpCardProps {
  card: TopUpCardData;
}

export default function TopUpCard({ card }: TopUpCardProps) {
  return (
    <Link href={`/topup/${card.id}`} className="group block">
        <Card className={cn(
            "overflow-hidden h-full flex flex-col transition-all group-hover:shadow-lg group-hover:-translate-y-1",
            "border-b-4 border-primary/80"
            )}>
            <CardContent className="p-2">
                <div className="aspect-square relative w-full rounded-t-lg overflow-hidden">
                <Image
                    src={card.image.src}
                    alt={card.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    data-ai-hint={card.image.hint}
                />
                </div>
            </CardContent>
            <div className="p-2 text-center flex-grow flex items-center justify-center bg-card">
                <h3 className="font-semibold text-sm truncate">{card.name}</h3>
            </div>
        </Card>
    </Link>
  );
}
