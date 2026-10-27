import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
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
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/models';

interface Props {
    product: Product;
}

export default function ProductShow({ product }: Props) {
    return <ProductDetails key={product.id} product={product} />;
}

function ProductDetails({ product }: Props) {
    const [paymentMonths, setPaymentMonths] = useState(0);
    const availableMonths = [
        ...(product.msi_3_months ? [3] : []),
        ...(product.msi_6_months ? [6] : []),
    ];
    const hasInstallments = availableMonths.length > 0;
    const selectedMonths = availableMonths.includes(paymentMonths)
        ? paymentMonths
        : 0;
    const finalPrice = Number(product.discounted_price ?? product.price);
    const paymentMessage = hasInstallments
        ? selectedMonths === 0
            ? ` Mi preferencia es pago de contado por ${formatPrice(finalPrice)}.`
            : ` Mi preferencia es ${selectedMonths} meses sin intereses de ${formatPrice(finalPrice / selectedMonths)} al mes (total: ${formatPrice(finalPrice)}).`
        : '';
    const { props } = usePage<{ whatsappNumber: string | null }>();
    const whatsappNumber = props.whatsappNumber;
    const canContact = product.stock > 0 && whatsappNumber;

    const whatsappHref = canContact
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `¡Hola! Me interesa el siguiente producto: ${product.name} (${product.model}). ${typeof window !== 'undefined' ? window.location.href : ''}.${paymentMessage} ¿Podrían darme más información?`,
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
                                    className="prose-themed prose prose-sm max-w-none"
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

                                {product.categories &&
                                    product.categories.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {product.categories.map((cat) => (
                                                <Link
                                                    key={cat.id}
                                                    href={`/products?category[]=${cat.id}`}
                                                    className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5"
                                                >
                                                    {cat.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                <ProductPrice
                                    price={product.price}
                                    discountedPrice={product.discounted_price}
                                    discount={product.discount}
                                    size="md"
                                />

                                {hasInstallments && (
                                    <fieldset className="space-y-2">
                                        <legend className="mb-2 text-sm font-medium">
                                            Opciones de pago
                                        </legend>
                                        {[0, ...availableMonths].map(
                                            (months) => (
                                                <label
                                                    key={months}
                                                    className="flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment-option"
                                                        value={months}
                                                        checked={
                                                            selectedMonths ===
                                                            months
                                                        }
                                                        onChange={() =>
                                                            setPaymentMonths(
                                                                months,
                                                            )
                                                        }
                                                        className="mt-1 shrink-0"
                                                    />
                                                    <span>
                                                        {months === 0
                                                            ? `Pago de contado: ${formatPrice(finalPrice)}`
                                                            : `${months} meses sin intereses de ${formatPrice(finalPrice / months)}`}
                                                    </span>
                                                </label>
                                            ),
                                        )}
                                    </fieldset>
                                )}

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
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-[color-mix(in_oklch,var(--primary),var(--foreground)_10%)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
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
