import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { stripHtml } from '@/lib/format';
import type { Product } from '@/types/models';
import BrandName from './brand-name';
import ProductAvailabilityBadge from './product-availability-badge';
import ProductCoverImage from './product-cover-image';
import ProductPrice from './product-price';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/products/${product.id}`} className="group block h-full">
            <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
                <div className="relative overflow-hidden bg-muted">
                    <ProductCoverImage
                        coverImage={product.cover_image}
                        alt={product.name}
                        className="aspect-[4/3] transition-transform duration-300 group-hover:scale-105"
                    />
                    <ProductAvailabilityBadge
                        availability={product.availability}
                        className="absolute top-2 right-2 gap-1 text-xs shadow-sm"
                    />
                </div>
                <CardContent className="space-y-1.5 p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
                        {product.name}
                    </h3>
                    {product.short_description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                            {stripHtml(product.short_description)}
                        </p>
                    )}
                    <BrandName brand={product.brand} />
                    <ProductPrice
                        price={product.price}
                        discountedPrice={product.discounted_price}
                        discount={product.discount}
                        size="sm"
                    />
                </CardContent>
            </Card>
        </Link>
    );
}
