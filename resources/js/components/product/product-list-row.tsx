import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/types/models';
import BrandName from './brand-name';
import ProductAvailabilityBadge from './product-availability-badge';
import ProductCoverImage from './product-cover-image';
import ProductPrice from './product-price';

interface ProductListRowProps {
    product: Product;
}

export default function ProductListRow({ product }: ProductListRowProps) {
    return (
        <Card className="group overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
            <div className="flex">
                <Link
                    href={`/products/${product.id}`}
                    className="relative size-24 shrink-0 overflow-hidden bg-muted"
                >
                    <ProductCoverImage
                        coverImage={product.cover_image}
                        alt={product.name}
                        aspect="square"
                        className="size-full rounded-none"
                    />
                </Link>

                <div className="flex flex-1 items-center">
                    <CardContent className="flex flex-1 items-center gap-4 p-4">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                                <ProductAvailabilityBadge
                                    availability={product.availability}
                                    className="gap-1 text-xs"
                                />
                                <BrandName brand={product.brand} />
                            </div>
                            <Link
                                href={`/products/${product.id}`}
                                className="block"
                            >
                                <h3 className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                                    {product.name}
                                </h3>
                            </Link>
                            {product.short_description && (
                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                    {product.short_description.replace(
                                        /<[^>]*>/g,
                                        '',
                                    )}
                                </p>
                            )}
                            {product.model && (
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Modelo: {product.model}
                                </p>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-4">
                            <ProductPrice
                                price={product.price}
                                discountedPrice={product.discounted_price}
                                discount={product.discount}
                                size="lg"
                            />
                            <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                        </div>
                    </CardContent>
                </div>
            </div>
        </Card>
    );
}
