import { Head, Link, usePage } from '@inertiajs/react';
import BrandName from '@/components/product/brand-name';
import ProductAvailabilityBadge from '@/components/product/product-availability-badge';
import ProductCoverImage from '@/components/product/product-cover-image';
import ProductImageCarousel from '@/components/product/product-image-carousel';
import ProductPrice from '@/components/product/product-price';
import WhatsAppIcon from '@/components/product/whatsapp-icon';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/types/models';

interface Props {
    product: Product;
}

export default function ProductShow({ product }: Props) {
    const { props } = usePage<{ whatsappNumber: string | null }>();
    const whatsappNumber = props.whatsappNumber;
    const canContact = product.stock > 0 && whatsappNumber;

    const whatsappHref = canContact
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `¡Hola! Me interesa el siguiente producto: ${product.name} (${product.model}). ${typeof window !== 'undefined' ? window.location.href : ''}. ¿Podrían darme más información?`,
          )}`
        : '#';

    return (
        <>
            <Head title={product.name} />
            <div className="container mx-auto px-4 py-8">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Inicio</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/products">Productos</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{product.name}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            {product.images && product.images.length > 0 ? (
                                <ProductImageCarousel
                                    images={product.images}
                                    productName={product.name}
                                />
                            ) : (
                                <div className="aspect-[16/9] overflow-hidden rounded-lg">
                                    <ProductCoverImage
                                        coverImage={product.cover_image}
                                        alt={product.name}
                                        className="h-full w-full rounded-lg object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {product.full_description && (
                            <div className="mb-8">
                                <h2 className="mb-4 text-2xl font-bold">
                                    Descripción
                                </h2>
                                <div
                                    className="prose prose-sm max-w-none text-muted-foreground"
                                    dangerouslySetInnerHTML={{
                                        __html: product.full_description,
                                    }}
                                />
                            </div>
                        )}

                        {product.metadata &&
                            Object.keys(product.metadata).length > 0 &&
                            (() => {
                                const entries = Object.entries(
                                    product.metadata,
                                ).filter(
                                    ([, value]) =>
                                        value !== null &&
                                        typeof value !== 'object',
                                );

                                if (entries.length === 0) {
                                    return null;
                                }

                                return (
                                    <div>
                                        <h2 className="mb-4 text-2xl font-bold">
                                            Especificaciones
                                        </h2>
                                        <Card>
                                            <CardContent className="p-0">
                                                <table className="w-full">
                                                    <tbody>
                                                        {entries.map(
                                                            (
                                                                [key, value],
                                                                index,
                                                            ) => (
                                                                <tr
                                                                    key={key}
                                                                    className={
                                                                        index %
                                                                            2 ===
                                                                        0
                                                                            ? 'bg-muted/50'
                                                                            : ''
                                                                    }
                                                                >
                                                                    <td className="px-4 py-3 font-medium">
                                                                        {key}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-muted-foreground">
                                                                        {String(
                                                                            value,
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ),
                                                        )}
                                                    </tbody>
                                                </table>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })()}
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardContent className="p-6">
                                <h1 className="mb-4 text-2xl font-bold">
                                    {product.name}
                                </h1>

                                <div className="mb-4 flex items-center gap-2">
                                    <ProductAvailabilityBadge
                                        availability={product.availability}
                                    />
                                    <BrandName brand={product.brand} />
                                </div>

                                <div className="mb-6">
                                    <ProductPrice
                                        price={product.price}
                                        discountedPrice={
                                            product.discounted_price
                                        }
                                        discount={product.discount}
                                        size="lg"
                                    />
                                </div>

                                <div className="space-y-3 border-t pt-4">
                                    {product.model && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Modelo:
                                            </span>
                                            <span className="text-sm font-medium">
                                                {product.model}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Stock:
                                        </span>
                                        <span className="text-sm font-medium">
                                            {product.stock} unidades
                                        </span>
                                    </div>
                                </div>

                                {canContact && (
                                    <div className="mt-6 border-t pt-4">
                                        <a
                                            href={whatsappHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#20bd5a] focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:outline-none"
                                        >
                                            <WhatsAppIcon className="h-8 w-8" />
                                            Consultar por WhatsApp
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
