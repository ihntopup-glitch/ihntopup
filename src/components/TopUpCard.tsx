import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import type { TopUpCardData } from '@/lib/data';
import Link from 'next/link';

interface TopUpCardProps {
  card: TopUpCardData;
}

export default function TopUpCard({ card }: TopUpCardProps) {
  return (
    <Link href={`/topup/${card.id}`} className="group block">
        <Card className="overflow-hidden h-full flex flex-col transition-colors group-hover:border-primary bg-green-100 dark:bg-green-900/20">
            <CardContent className="p-0">
                <div className="aspect-square relative w-full">
                <Image
                    src={card.image.src}
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    data-ai-hint={card.image.hint}
                />
                </div>
            </CardContent>
            <div className="p-2 text-center flex-grow flex items-center justify-center">
                <h3 className="font-semibold text-sm truncate">{card.name}</h3>
            </div>
        </Card>
    </Link>
  );
}
