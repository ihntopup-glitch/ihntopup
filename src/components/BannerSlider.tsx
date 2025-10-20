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
import * as React from 'react';

interface BannerSliderProps {
  banners: BannerData[];
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )

  return (
    <Carousel 
      plugins={[plugin.current]}
      className="w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      opts={{ loop: true }}
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <div className="p-1">
              <Card className="overflow-hidden">
                <CardContent className="relative flex aspect-[1920/791] items-center justify-center p-0">
                  <Image
                    src={banner.image.src}
                    alt={banner.alt}
                    fill
                    className="object-cover"
                    data-ai-hint={banner.image.hint}
                  />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
