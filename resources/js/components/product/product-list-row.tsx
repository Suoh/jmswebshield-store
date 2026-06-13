import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/types/models';
import ProductPlaceholderImage from './product-placeholder-image';

interface ProductListRowProps {
    product: Product;
}

export default function ProductListRow({ product }: ProductListRowProps) {
    const isAvailable = product.availability === 'Disponible';

    return (
        <Card className="group overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
            <div className="flex">
                <Link
                    href={`/products/${product.id}`}
                    className="relative size-24 shrink-0 overflow-hidden bg-muted"
                >
                    {product.cover_image ? (
                        <img
                            src={product.cover_image}
                            alt={product.name}
                            className="size-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <ProductPlaceholderImage className="aspect-square size-full rounded-none" />
                    )}
                </Link>

                <div className="flex flex-1 items-center">
                    <CardContent className="flex flex-1 items-center gap-4 p-4">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                                <Badge
                                    variant={
                                        isAvailable ? 'default' : 'destructive'
                                    }
                                    className="gap-1 text-xs"
                                >
                                    {isAvailable ? (
                                        <CheckCircle2 className="size-2.5" />
                                    ) : (
                                        <Circle className="size-2.5 fill-current" />
                                    )}
                                    {product.availability}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {product.brand?.name === 'sinmarca'
                                        ? 'Sin marca'
                                        : (product.brand?.name ?? 'Sin marca')}
                                </span>
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
                            <div className="text-right">
                                {product.discounted_price ? (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs text-muted-foreground line-through">
                                            ${product.price}
                                        </span>
                                        <span className="text-base font-bold text-primary">
                                            ${product.discounted_price}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-base font-bold">
                                        ${product.price}
                                    </span>
                                )}
                                {product.discount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 text-xs"
                                    >
                                        -{product.discount}%
                                    </Badge>
                                )}
                            </div>
                            <ArrowRight className="size-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                        </div>
                    </CardContent>
                </div>
            </div>
        </Card>
    );
}
