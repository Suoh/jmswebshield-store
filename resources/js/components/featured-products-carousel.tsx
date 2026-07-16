import { Link } from '@inertiajs/react';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';
import { ImageIcon } from 'lucide-react';
import { useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/format';
import type { FeaturedItem, Product } from '@/types';

interface FeaturedProductsCarouselProps {
    items: FeaturedItem[];
}

export default function FeaturedProductsCarousel({
    items,
}: FeaturedProductsCarouselProps) {
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
                <h2 className="text-xl font-bold">Productos destacados</h2>
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
                        const product = item.featurable as Product;

                        return (
                            <div
                                key={item.id}
                                className="min-w-0 shrink-0 grow-0 basis-[calc(50%-16px)] pl-4 sm:basis-[calc(33.33%-16px)] md:basis-[calc(25%-16px)] lg:basis-[calc(20%-16px)]"
                            >
                                <Link
                                    href={`/products/${product.id}`}
                                    className="group block overflow-hidden rounded-xl border bg-card transition hover:border-primary/40 hover:shadow-md"
                                >
                                    <div className="aspect-square overflow-hidden bg-muted">
                                        {product.cover_image ? (
                                            <img
                                                src={product.cover_image}
                                                alt={product.name}
                                                className="size-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center">
                                                <ImageIcon className="size-8 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="mb-1">
                                            {product.brand && (
                                                <span className="text-xs text-muted-foreground">
                                                    {product.brand.name}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="truncate font-semibold">
                                            {product.name}
                                        </h3>
                                        <div className="mt-2 flex items-center gap-2">
                                            {product.discounted_price ? (
                                                <>
                                                    <span className="text-lg font-bold text-primary">
                                                        {formatPrice(
                                                            product.discounted_price,
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground line-through">
                                                        {formatPrice(
                                                            product.price,
                                                        )}
                                                    </span>
                                                    <Badge
                                                        variant="default"
                                                        className="bg-primary text-xs"
                                                    >
                                                        -{product.discount}%
                                                    </Badge>
                                                </>
                                            ) : (
                                                <span className="text-lg font-bold">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {product.availability}
                                        </p>
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
