'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { BannerData } from '@/lib/data';
import Autoplay from "embla-carousel-autoplay"
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

interface BannerSliderProps {
  banners: BannerData[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  const renderBannerContent = (banner: BannerData) => (
    <div className="p-1">
      <Card className="overflow-hidden">
        <CardContent className="relative flex items-center justify-center p-0 aspect-[1920/791] lg:h-[275px] lg:max-w-[1006px] mx-auto">
          <Image
            src={banner.imageUrl || (banner.image?.src ?? "https://placehold.co/1920x791")}
            alt={banner.alt || 'Promotional banner'}
            fill
            className="object-cover"
            data-ai-hint={banner.image?.hint}
          />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Carousel 
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{ loop: true }}
    >
      <CarouselContent>
        {banners.filter(b => b.isActive).map((banner) => {
          const isInternalLink = banner.linkUrl.startsWith('/');

          return (
             <CarouselItem key={banner.id}>
                {isInternalLink ? (
                    <Link href={banner.linkUrl} passHref>
                        {renderBannerContent(banner)}
                    </Link>
                ) : (
                    <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
                        {renderBannerContent(banner)}
                    </a>
                )}
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
