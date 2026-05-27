import { Head, Link } from '@inertiajs/react';
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
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products.data.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.id}`}
                                    className="group"
                                >
                                    <Card className="h-full transition-shadow hover:shadow-lg">
                                        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                                            <img
                                                src={
                                                    product.cover_image ||
                                                    'https://via.placeholder.com/400x300?text=Sin+imagen'
                                                }
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <Badge
                                                variant={
                                                    product.availability ===
                                                    'Disponible'
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                                className="absolute top-2 right-2"
                                            >
                                                {product.availability}
                                            </Badge>
                                        </div>
                                        <CardContent className="p-4">
                                            <h2 className="mb-2 line-clamp-1 text-lg font-semibold">
                                                {product.name}
                                            </h2>
                                            {product.short_description && (
                                                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                                                    {product.short_description}
                                                </p>
                                            )}
                                            {product.brand && (
                                                <p className="mb-2 text-xs text-muted-foreground">
                                                    {product.brand.name}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                {product.discounted_price ? (
                                                    <>
                                                        <span className="text-sm text-muted-foreground line-through">
                                                            ${product.price}
                                                        </span>
                                                        <span className="text-lg font-bold text-primary">
                                                            $
                                                            {
                                                                product.discounted_price
                                                            }
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-lg font-bold">
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
