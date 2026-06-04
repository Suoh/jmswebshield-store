import { Head, Link, usePage } from '@inertiajs/react';
import ProductImageCarousel from '@/components/product/product-image-carousel';
import { Badge } from '@/components/ui/badge';
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

const WHATSAPP_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%2325D366' d='M16.004 0h-.028C7.176 0 0 7.191 0 16.02c0 3.484 1.121 6.656 3.033 9.206L.996 32l6.731-1.766C9.9 31.183 12.824 32 16.004 32 24.822 32 32 24.809 32 16.02S24.822 0 16.004 0z'/%3E%3Cpath fill='%23fff' d='M11.203 9.28c-.588-.262-3.538-1.748-4.08-1.95-.543-.2-.938-.302-1.332.303-.395.604-1.528 1.95-1.872 2.351-.344.4-.688.452-1.278.151-.588-.302-2.485-1.117-4.737-3.565-1.848-2.008-3.094-4.478-3.445-5.242-.35-.765-.037-1.17.263-1.55.27-.341.603-.887.905-1.33.276-.403.553-.486.932-.486.378 0 .905.151 1.41.756.504.605 1.92 2.076 1.92 3.96 0 1.885-.763 3.494-1.09 3.958-.327.463-.592 1.032-.104 1.644.491.61 2.182 2.477 4.707 4.185 1.636 1.107 2.925 1.787 3.94 2.286.675.33 1.22.538 1.658.723.743.314 1.423.272 1.958-.15.65-.515 1.047-1.332 1.188-1.752.141-.42.07-.773-.034-1.086-.11-.31-.41-.508-.854-.889z'/%3E%3C/svg%3E`;

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
                                    <img
                                        src={
                                            product.cover_image ||
                                            'https://via.placeholder.com/800x450?text=Sin+imagen'
                                        }
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {product.full_description && (
                            <div className="mb-8">
                                <h2 className="mb-4 text-2xl font-bold">
                                    Descripción
                                </h2>
                                <p className="whitespace-pre-line text-muted-foreground">
                                    {product.full_description}
                                </p>
                            </div>
                        )}

                        {product.metadata &&
                            Object.keys(product.metadata).length > 0 && (
                                <div>
                                    <h2 className="mb-4 text-2xl font-bold">
                                        Especificaciones
                                    </h2>
                                    <Card>
                                        <CardContent className="p-0">
                                            <table className="w-full">
                                                <tbody>
                                                    {Object.entries(
                                                        product.metadata,
                                                    ).map(
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
                                                                    {value}
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                    </div>

                    <div className="lg:col-span-1">
                        <Card className="sticky top-4">
                            <CardContent className="p-6">
                                <h1 className="mb-4 text-2xl font-bold">
                                    {product.name}
                                </h1>

                                <div className="mb-4 flex items-center gap-2">
                                    <Badge
                                        variant={
                                            product.availability ===
                                            'Disponible'
                                                ? 'default'
                                                : 'destructive'
                                        }
                                    >
                                        {product.availability}
                                    </Badge>
                                    {product.brand && (
                                        <span className="text-sm text-muted-foreground">
                                            {product.brand.name}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-6">
                                    {product.discounted_price ? (
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-sm text-muted-foreground line-through">
                                                ${product.price}
                                            </span>
                                            <span className="text-3xl font-bold text-primary">
                                                ${product.discounted_price}
                                            </span>
                                            <Badge variant="secondary">
                                                -{product.discount}%
                                            </Badge>
                                        </div>
                                    ) : (
                                        <span className="text-3xl font-bold">
                                            ${product.price}
                                        </span>
                                    )}
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
                                            <img
                                                src={WHATSAPP_ICON}
                                                alt=""
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                            />
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
