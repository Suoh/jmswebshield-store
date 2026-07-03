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
            <div className="container mx-auto px-4 py-6">
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

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                            <div className="mb-6">
                                <h2 className="mb-3 font-heading text-lg font-semibold">
                                    Descripción
                                </h2>
                                <div
                                    className="text-sm leading-relaxed text-foreground/80"
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
                                        <h2 className="mb-3 font-heading text-lg font-semibold">
                                            Especificaciones
                                        </h2>
                                        <Card className="overflow-hidden transition-all hover:border-primary/40">
                                            <CardContent className="p-0">
                                                <table className="w-full text-sm">
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
                                                                    <td className="w-1/3 px-3 py-2.5 font-medium">
                                                                        {key}
                                                                    </td>
                                                                    <td className="px-3 py-2.5 text-muted-foreground">
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
                        <Card className="sticky top-6 transition-all hover:border-primary/40 hover:shadow-md">
                            <CardContent className="space-y-4 p-5">
                                <h1 className="font-heading text-xl font-semibold">
                                    {product.name}
                                </h1>

                                <div className="flex flex-wrap items-center gap-2">
                                    <ProductAvailabilityBadge
                                        availability={product.availability}
                                    />
                                    <BrandName brand={product.brand} />
                                </div>

                                <ProductPrice
                                    price={product.price}
                                    discountedPrice={product.discounted_price}
                                    discount={product.discount}
                                    size="md"
                                />

                                {(product.model || product.stock > 0) && (
                                    <dl className="space-y-2 border-t pt-3 text-sm">
                                        {product.model && (
                                            <div className="flex justify-between">
                                                <dt className="text-muted-foreground">
                                                    Modelo
                                                </dt>
                                                <dd className="font-medium">
                                                    {product.model}
                                                </dd>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <dt className="text-muted-foreground">
                                                Stock
                                            </dt>
                                            <dd className="font-medium">
                                                {product.stock} unidades
                                            </dd>
                                        </div>
                                    </dl>
                                )}

                                {canContact && (
                                    <div className="border-t pt-3">
                                        <a
                                            href={whatsappHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
                                        >
                                            <WhatsAppIcon className="h-7 w-7" />
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
