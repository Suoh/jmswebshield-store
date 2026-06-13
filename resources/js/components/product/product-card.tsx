import { Link } from '@inertiajs/react';
import { CheckCircle2, Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/types/models';
import ProductPlaceholderImage from './product-placeholder-image';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const isAvailable = product.availability === 'Disponible';

    return (
        <Link href={`/products/${product.id}`} className="group block h-full">
            <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {product.cover_image ? (
                        <img
                            src={product.cover_image}
                            alt={product.name}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <ProductPlaceholderImage />
                    )}
                    <Badge
                        variant={isAvailable ? 'default' : 'destructive'}
                        className="absolute top-2 right-2 gap-1 text-xs shadow-sm"
                    >
                        {isAvailable ? (
                            <CheckCircle2 className="size-2.5" />
                        ) : (
                            <Circle className="size-2.5 fill-current" />
                        )}
                        {product.availability}
                    </Badge>
                </div>
                <CardContent className="space-y-1.5 p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                        {product.name}
                    </h3>
                    {product.short_description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                            {product.short_description.replace(/<[^>]*>/g, '')}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {product.brand?.name === 'sinmarca'
                            ? 'Sin marca'
                            : (product.brand?.name ?? 'Sin marca')}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                        {product.discounted_price ? (
                            <>
                                <span className="text-xs text-muted-foreground line-through">
                                    ${product.price}
                                </span>
                                <span className="text-sm font-bold text-primary">
                                    ${product.discounted_price}
                                </span>
                                {product.discount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-auto text-xs"
                                    >
                                        -{product.discount}%
                                    </Badge>
                                )}
                            </>
                        ) : (
                            <span className="text-sm font-bold">
                                ${product.price}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
