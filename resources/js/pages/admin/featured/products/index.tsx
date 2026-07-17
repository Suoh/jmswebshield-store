import { router, usePage } from '@inertiajs/react';
import { ImageIcon, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import FeaturedItemModal from '@/components/featured-item-modal';
import FeaturedItemTable, {
    FeaturedItemRow,
} from '@/components/featured-item-table';
import { Button } from '@/components/ui/button';
import {
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { formatPrice } from '@/lib/format';
import type { FeaturedItem, Product } from '@/types';

interface PageProps {
    items: FeaturedItem[];
    products: Product[];
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

export default function AdminFeaturedProductsIndex() {
    const { items, products, flash } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    useFlashToast(flash);

    const filteredProducts = useMemo(
        () =>
            products.filter((p) => {
                const term = searchTerm.toLowerCase();

                return (
                    p.name.toLowerCase().includes(term) ||
                    (p.model ?? '').toLowerCase().includes(term) ||
                    (p.brand?.name ?? '').toLowerCase().includes(term)
                );
            }),
        [products, searchTerm],
    );

    const handleAddProduct = (productId: number) => {
        router.post(
            '/admin/featured/products',
            { product_id: productId } as never,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    setSearchTerm('');
                },
                onError: () => {
                    toast.error('Error al agregar el producto.');
                },
            },
        );
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Productos destacados</h1>
                <FeaturedItemModal
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    trigger={
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Añadir producto
                        </Button>
                    }
                    title="Añadir producto destacado"
                    description="Buscá y seleccioná un producto para destacar en el catálogo público."
                    searchPlaceholder="Buscar por nombre, modelo o marca..."
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    items={filteredProducts}
                    emptySearchMessage="No se encontraron productos."
                    emptyAvailableMessage="No hay productos disponibles para agregar."
                    onItemSelect={(id) => handleAddProduct(id)}
                    renderItem={(product) => (
                        <>
                            {product.cover_image ? (
                                <img
                                    src={product.cover_image}
                                    alt={product.name}
                                    className="size-12 shrink-0 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                                    <ImageIcon className="size-4 text-muted-foreground" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">
                                    {product.name}
                                </p>
                                <p className="truncate text-sm text-muted-foreground">
                                    {product.brand?.name ?? 'Sin marca'}{' '}
                                    {product.model ? `· ${product.model}` : ''}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="font-medium">
                                    {formatPrice(product.price)}
                                </p>
                                {product.discounted_price && (
                                    <p className="text-xs text-muted-foreground line-through">
                                        {formatPrice(product.price)}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                />
            </div>

            <FeaturedItemTable
                items={items}
                droppableId="featured-products"
                reorderUrl="/admin/featured/products/reorder"
                deleteUrl="/admin/featured/products"
                deleteDialogTitle="Quitar producto destacado"
                getDeleteDialogDescription={(name) =>
                    `¿Estás seguro de que deseas quitar "${name}" del carrusel de destacados?`
                }
                getName={(item) => {
                    const product = item.featurable as Product;

                    return product.name;
                }}
                deleteErrorMessage="Error al remover el producto."
                emptyIcon={ImageIcon}
                emptyTitle="No hay productos destacados"
                emptyDescription='Agregá productos usando el botón "Añadir producto".'
            >
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10" />
                        <TableHead>Producto</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                {items.map((item, index) => {
                    const product = item.featurable as Product;

                    return (
                        <FeaturedItemRow
                            key={item.id}
                            item={item}
                            index={index}
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {product.cover_image ? (
                                        <img
                                            src={product.cover_image}
                                            alt={product.name}
                                            className="size-10 w-14 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-10 w-14 items-center justify-center rounded-md bg-muted">
                                            <ImageIcon className="size-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {product.name}
                                        </p>
                                        {product.model && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {product.model}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {product.brand?.name ?? (
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div>
                                    {product.discounted_price ? (
                                        <>
                                            <span className="font-medium">
                                                {formatPrice(
                                                    product.discounted_price,
                                                )}
                                            </span>
                                            <span className="ml-1 text-xs text-muted-foreground line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="font-medium">
                                            {formatPrice(product.price)}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                        </FeaturedItemRow>
                    );
                })}
            </FeaturedItemTable>
        </div>
    );
}
