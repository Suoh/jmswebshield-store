import { Head, Link } from '@inertiajs/react';
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

export default function ProductShow({ product }: Props) {
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
                        <div className="mb-6 aspect-[16/9] overflow-hidden rounded-lg">
                            <img
                                src={
                                    product.cover_image ||
                                    'https://via.placeholder.com/800x450?text=Sin+imagen'
                                }
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
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

                        {product.extra_data &&
                            Object.keys(product.extra_data).length > 0 && (
                                <div>
                                    <h2 className="mb-4 text-2xl font-bold">
                                        Especificaciones
                                    </h2>
                                    <Card>
                                        <CardContent className="p-0">
                                            <table className="w-full">
                                                <tbody>
                                                    {Object.entries(
                                                        product.extra_data,
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
                                    {product.marca && (
                                        <span className="text-sm text-muted-foreground">
                                            {product.marca.name}
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
