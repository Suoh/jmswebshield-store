import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { router, usePage } from '@inertiajs/react';
import { GripVertical, ImageIcon, Plus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
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
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);

    useFlashToast(flash);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const reordered = Array.from(items);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);

        router.put(
            '/admin/featured/products/reorder',
            { ids: reordered.map((item) => item.id) },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Orden actualizado.'),
                onError: () => toast.error('Error al reordenar.'),
            },
        );
    };

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

    const confirmDelete = () => {
        if (deleteTarget) {
            router.delete(`/admin/featured/products/${deleteTarget}`, {
                preserveScroll: true,
                onError: () => toast.error('Error al remover el producto.'),
            });
            setDeleteTarget(null);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Productos destacados</h1>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Añadir producto
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Añadir producto destacado</DialogTitle>
                            <DialogDescription>
                                Buscá y seleccioná un producto para destacar en
                                el catálogo público.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    placeholder="Buscar por nombre, modelo o marca..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    autoFocus
                                />
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {filteredProducts.length === 0 ? (
                                    <p className="py-8 text-center text-muted-foreground">
                                        {searchTerm
                                            ? 'No se encontraron productos.'
                                            : 'No hay productos disponibles para agregar.'}
                                    </p>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredProducts.map((product) => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition hover:bg-muted"
                                                onClick={() =>
                                                    handleAddProduct(product.id)
                                                }
                                            >
                                                {product.cover_image ? (
                                                    <img
                                                        src={
                                                            product.cover_image
                                                        }
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
                                                        {product.brand?.name ??
                                                            'Sin marca'}{' '}
                                                        {product.model
                                                            ? `· ${product.model}`
                                                            : ''}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <p className="font-medium">
                                                        {formatPrice(
                                                            product.price,
                                                        )}
                                                    </p>
                                                    {product.discounted_price && (
                                                        <p className="text-xs text-muted-foreground line-through">
                                                            {formatPrice(
                                                                product.price,
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                    <ImageIcon className="size-12" />
                    <p className="text-lg font-medium">
                        No hay productos destacados
                    </p>
                    <p className="text-sm">
                        Agregá productos usando el botón "Añadir producto".
                    </p>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="featured-products">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10" />
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Marca</TableHead>
                                            <TableHead>Precio</TableHead>
                                            <TableHead className="text-right">
                                                Acciones
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => {
                                            const product =
                                                item.featurable as Product;

                                            return (
                                                <Draggable
                                                    key={item.id}
                                                    draggableId={String(
                                                        item.id,
                                                    )}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <TableRow
                                                            ref={
                                                                provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                        >
                                                            <TableCell>
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className="cursor-grab text-muted-foreground hover:text-foreground"
                                                                >
                                                                    <GripVertical className="size-4" />
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    {product.cover_image ? (
                                                                        <img
                                                                            src={
                                                                                product.cover_image
                                                                            }
                                                                            alt={
                                                                                product.name
                                                                            }
                                                                            className="size-10 w-14 rounded-md object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex size-10 w-14 items-center justify-center rounded-md bg-muted">
                                                                            <ImageIcon className="size-4 text-muted-foreground" />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <p className="truncate font-medium">
                                                                            {
                                                                                product.name
                                                                            }
                                                                        </p>
                                                                        {product.model && (
                                                                            <p className="truncate text-xs text-muted-foreground">
                                                                                {
                                                                                    product.model
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {product.brand
                                                                    ?.name ?? (
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
                                                                                {formatPrice(
                                                                                    product.price,
                                                                                )}
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="font-medium">
                                                                            {formatPrice(
                                                                                product.price,
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-destructive hover:text-destructive"
                                                                            onClick={() =>
                                                                                setDeleteTarget(
                                                                                    item.id,
                                                                                )
                                                                            }
                                                                        >
                                                                            <X className="mr-1 size-4" />
                                                                            Quitar
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>
                                                                                Quitar
                                                                                producto
                                                                                destacado
                                                                            </AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                ¿Estás
                                                                                seguro
                                                                                de
                                                                                que
                                                                                deseas
                                                                                quitar
                                                                                "
                                                                                {
                                                                                    product.name
                                                                                }

                                                                                "
                                                                                del
                                                                                carrusel
                                                                                de
                                                                                destacados?
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>
                                                                                Cancelar
                                                                            </AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                                onClick={
                                                                                    confirmDelete
                                                                                }
                                                                            >
                                                                                Quitar
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
}
