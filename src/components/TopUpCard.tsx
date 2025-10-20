import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TopUpCardData } from '@/lib/data';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface TopUpCardProps {
  card: TopUpCardData;
}

export default function TopUpCard({ card }: TopUpCardProps) {
  return (
    <Link href={`/topup/${card.id}`} className="group block">
        <Card className="overflow-hidden h-full flex flex-col transition-colors group-hover:border-primary">
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
            <div className="p-4 flex-grow">
                <h3 className="font-semibold truncate">{card.name}</h3>
                <p className="text-sm text-muted-foreground">From ${card.price.toFixed(2)}</p>
            </div>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-primary hover:bg-accent" tabIndex={-1}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View Details
                </Button>
            </CardFooter>
        </Card>
    </Link>
  );
}
