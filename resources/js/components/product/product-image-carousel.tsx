'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/models';

interface ProductImageCarouselProps {
    images: ProductImage[];
    productName: string;
}

export default function ProductImageCarousel({
    images,
    productName,
}: ProductImageCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: images.length > 1,
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) {
            emblaApi.scrollPrev();
        }
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) {
            emblaApi.scrollNext();
        }
    }, [emblaApi]);

    const onThumbClick = (index: number) => {
        if (!emblaApi) {
            return;
        }

        emblaApi.scrollTo(index);
    };

    if (images.length === 0) {
        return (
            <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg bg-muted">
                <span className="text-muted-foreground">Sin imagen</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="relative overflow-hidden rounded-lg">
                <div ref={emblaRef} className="overflow-hidden">
                    <div className="flex">
                        {images.map((image, index) => (
                            <div key={image.id} className="flex-[0_0_100%]">
                                <img
                                    src={`/storage/${image.path}`}
                                    alt={`${productName} - imagen ${index + 1}`}
                                    className="aspect-[16/9] w-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {images.length > 1 && (
                    <>
                        <button
                            onClick={scrollPrev}
                            className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeftIcon className="size-5" />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                            aria-label="Siguiente imagen"
                        >
                            <ChevronRightIcon className="size-5" />
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((image, index) => (
                        <button
                            key={image.id}
                            onClick={() => onThumbClick(index)}
                            className={cn(
                                'relative flex-shrink-0 overflow-hidden rounded-md border-2 transition-all',
                                image.is_cover
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-transparent opacity-60 hover:opacity-100',
                            )}
                        >
                            <img
                                src={`/storage/${image.path}`}
                                alt={`Miniatura ${index + 1}`}
                                className="size-16 object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
