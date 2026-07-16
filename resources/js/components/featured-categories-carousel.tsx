import { Link } from '@inertiajs/react';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ImageIcon } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { Category, FeaturedItem } from '@/types';

interface FeaturedCategoriesCarouselProps {
    items: FeaturedItem[];
}

export default function FeaturedCategoriesCarousel({
    items,
}: FeaturedCategoriesCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: false, align: 'start', dragFree: true },
        [
            Autoplay({
                stopOnInteraction: false,
                stopOnMouseEnter: true,
                delay: 5000,
            }),
        ],
    );

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    if (items.length === 0) {
        return null;
    }

    return (
        <section className="relative">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Categorías destacadas</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={scrollPrev}
                    >
                        <span className="sr-only">Anterior</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-4"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={scrollNext}
                    >
                        <span className="sr-only">Siguiente</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-4"
                        >
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </Button>
                </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
                <div className="-ml-4 flex touch-pan-y">
                    {items.map((item) => {
                        const category = item.featurable as Category;

                        return (
                            <div
                                key={item.id}
                                className="min-w-0 shrink-0 grow-0 basis-[calc(50%-16px)] pl-4 sm:basis-[calc(33.33%-16px)] md:basis-[calc(25%-16px)] lg:basis-[calc(20%-16px)]"
                            >
                                <Link
                                    href={`/products?category[]=${category.id}`}
                                    preserveScroll
                                    className="group block overflow-hidden rounded-xl border bg-card transition hover:border-primary/40 hover:shadow-md"
                                >
                                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                                        {category.image_url ? (
                                            <img
                                                src={category.image_url}
                                                alt={category.name}
                                                className="size-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center">
                                                <ImageIcon className="size-8 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold">
                                            {category.name}
                                        </h3>
                                        {category.products_count !==
                                            undefined && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {category.products_count}{' '}
                                                producto
                                                {category.products_count !== 1
                                                    ? 's'
                                                    : ''}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
