import { Head, Link } from '@inertiajs/react';
import ProductPlaceholderImage from '@/components/product/product-placeholder-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Product, PaginatedData } from '@/types/models';

interface Props {
    products: PaginatedData<Product>;
}

export default function ProductIndex({ products }: Props) {
    return (
        <>
            <Head title="Catálogo de productos" />
            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold">
                    Catálogo de productos
                </h1>

                {products.data.length === 0 ? (
                    <div className="flex min-h-[400px] items-center justify-center">
                        <p className="text-lg text-muted-foreground">
                            No hay productos disponibles
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                            {products.data.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.id}`}
                                    className="group"
                                >
                                    <Card className="h-full transition-shadow hover:shadow-lg">
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                                            {product.cover_image ? (
                                                <img
                                                    src={product.cover_image}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <ProductPlaceholderImage />
                                            )}
                                            <Badge
                                                variant={
                                                    product.availability ===
                                                    'Disponible'
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                                className="absolute top-1.5 right-1.5 text-xs"
                                            >
                                                {product.availability}
                                            </Badge>
                                        </div>
                                        <CardContent className="p-3">
                                            <h2 className="mb-1 line-clamp-1 text-sm font-semibold">
                                                {product.name}
                                            </h2>
                                            {product.short_description && (
                                                <p className="mb-1 line-clamp-1 text-xs text-muted-foreground">
                                                    {product.short_description.replace(
                                                        /<[^>]*>/g,
                                                        '',
                                                    )}
                                                </p>
                                            )}
                                            {product.brand && (
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    {product.brand.name ===
                                                    'sinmarca'
                                                        ? 'Sin marca'
                                                        : product.brand.name}
                                                </p>
                                            )}
                                            {!product.brand && (
                                                <p className="mb-1 text-xs text-muted-foreground">
                                                    Sin marca
                                                </p>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                {product.discounted_price ? (
                                                    <>
                                                        <span className="text-xs text-muted-foreground line-through">
                                                            ${product.price}
                                                        </span>
                                                        <span className="text-sm font-bold text-primary">
                                                            $
                                                            {
                                                                product.discounted_price
                                                            }
                                                        </span>
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
                            ))}
                        </div>

                        {products.last_page > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                {products.links.map((link, index) => (
                                    <Button
                                        key={index}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        asChild
                                    >
                                        <Link
                                            href={link.url || '#'}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
