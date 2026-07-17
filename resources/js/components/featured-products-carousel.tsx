import { Link } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';
import CarouselSection from '@/components/carousel-section';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/format';
import type { FeaturedItem, Product } from '@/types';

interface FeaturedProductsCarouselProps {
    items: FeaturedItem[];
}

export default function FeaturedProductsCarousel({
    items,
}: FeaturedProductsCarouselProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <CarouselSection
            title="Productos destacados"
            items={items}
            autoplayDelay={5000}
            itemClassName="basis-[calc(50%-16px)] sm:basis-[calc(33.33%-16px)] md:basis-[calc(25%-16px)] lg:basis-[calc(20%-16px)]"
            renderItem={(item) => {
                const product = item.featurable as Product;

                return (
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
                                            {formatPrice(product.price)}
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
                );
            }}
        />
    );
}
