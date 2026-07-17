import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { Banner } from '@/types/models';

interface BannerCarouselProps {
    banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: banners.length > 1 },
        banners.length > 1
            ? [
                  Autoplay({
                      delay: 6000,
                      stopOnInteraction: true,
                  }),
              ]
            : [],
    );

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    if (banners.length === 0) {
        return null;
    }

    return (
        <div className="relative overflow-hidden rounded-xl">
            <div ref={emblaRef} className="overflow-hidden">
                <div className="flex">
                    {banners.map((banner) => (
                        <div key={banner.id} className="flex-[0_0_100%]">
                            {banner.link_url ? (
                                <a
                                    href={banner.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={banner.image_url}
                                        alt={banner.name}
                                        className="aspect-[21/6.3] w-full object-cover"
                                    />
                                </a>
                            ) : (
                                <img
                                    src={banner.image_url}
                                    alt={banner.name}
                                    className="aspect-[21/6.3] w-full object-cover"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {banners.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        className="absolute top-1/2 left-3 h-auto w-auto -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 hover:text-white"
                        onClick={scrollPrev}
                        aria-label="Anterior"
                    >
                        <ChevronLeftIcon className="size-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="absolute top-1/2 right-3 h-auto w-auto -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 hover:text-white"
                        onClick={scrollNext}
                        aria-label="Siguiente"
                    >
                        <ChevronRightIcon className="size-5" />
                    </Button>
                </>
            )}
        </div>
    );
}
