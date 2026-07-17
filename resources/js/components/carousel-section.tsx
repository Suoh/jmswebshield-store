import Autoplay from 'embla-carousel-autoplay';
import type useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    useCarousel,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface CarouselSectionProps<T> {
    title: string;
    items: T[];
    renderItem: (item: T, index?: number) => ReactNode;
    itemClassName?: string;
    opts?: CarouselOptions;
    autoplayDelay?: number;
    className?: string;
}

function CarouselSectionNav() {
    const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
        useCarousel();

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={!canScrollPrev}
                onClick={scrollPrev}
            >
                <ChevronLeftIcon className="size-4" />
                <span className="sr-only">Anterior</span>
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={!canScrollNext}
                onClick={scrollNext}
            >
                <ChevronRightIcon className="size-4" />
                <span className="sr-only">Siguiente</span>
            </Button>
        </div>
    );
}

export default function CarouselSection<T>({
    title,
    items,
    renderItem,
    itemClassName,
    opts,
    autoplayDelay,
    className,
}: CarouselSectionProps<T>) {
    const plugins = autoplayDelay
        ? [
              Autoplay({
                  delay: autoplayDelay,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
              }),
          ]
        : undefined;

    return (
        <section className={cn('relative', className)}>
            <Carousel
                opts={{
                    loop: false,
                    align: 'start',
                    dragFree: true,
                    ...opts,
                }}
                plugins={plugins}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <CarouselSectionNav />
                </div>
                <CarouselContent>
                    {items.map((item, index) => (
                        <CarouselItem
                            key={index}
                            className={cn(
                                'min-w-0 shrink-0 grow-0',
                                itemClassName,
                            )}
                        >
                            {renderItem(item, index)}
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
}
