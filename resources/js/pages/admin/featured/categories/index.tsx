import { router, usePage } from '@inertiajs/react';
import { ImageIcon, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import FeaturedItemModal from '@/components/featured-item-modal';
import FeaturedItemTable, {
    FeaturedItemRow,
} from '@/components/featured-item-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import type { Category, FeaturedItem } from '@/types';

interface PageProps {
    items: FeaturedItem[];
    categories: Category[];
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

export default function AdminFeaturedCategoriesIndex() {
    const { items, categories, flash } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    useFlashToast(flash);

    const filteredCategories = useMemo(
        () =>
            categories.filter((c) => {
                const term = searchTerm.toLowerCase();

                return c.name.toLowerCase().includes(term);
            }),
        [categories, searchTerm],
    );

    const handleAddCategory = (categoryId: number) => {
        router.post(
            '/admin/featured/categories',
            { category_id: categoryId } as never,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    setSearchTerm('');
                },
                onError: () => {
                    toast.error('Error al agregar la categoría.');
                },
            },
        );
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Categorías destacadas</h1>
                <FeaturedItemModal
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    trigger={
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Añadir categoría
                        </Button>
                    }
                    title="Añadir categoría destacada"
                    description="Buscá y seleccioná una categoría para destacar en el catálogo público."
                    searchPlaceholder="Buscar por nombre..."
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    items={filteredCategories}
                    emptySearchMessage="No se encontraron categorías."
                    emptyAvailableMessage="No hay categorías disponibles para agregar."
                    onItemSelect={(id) => handleAddCategory(id)}
                    renderItem={(cat) => (
                        <>
                            {cat.image_url ? (
                                <img
                                    src={cat.image_url}
                                    alt={cat.name}
                                    className="size-12 shrink-0 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
                                    <ImageIcon className="size-4 text-muted-foreground" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">
                                    {cat.name}
                                </p>
                            </div>
                            <div className="shrink-0">
                                <Badge variant="secondary">
                                    {cat.products_count ?? 0} productos
                                </Badge>
                            </div>
                        </>
                    )}
                />
            </div>

            <FeaturedItemTable
                items={items}
                droppableId="featured-categories"
                reorderUrl="/admin/featured/categories/reorder"
                deleteUrl="/admin/featured/categories"
                deleteDialogTitle="Quitar categoría destacada"
                getDeleteDialogDescription={(name) =>
                    `¿Estás seguro de que deseas quitar la categoría "${name}" del carrusel de destacadas?`
                }
                getName={(item) => {
                    const cat = item.featurable as Category;

                    return cat.name;
                }}
                deleteErrorMessage="Error al remover la categoría."
                emptyIcon={ImageIcon}
                emptyTitle="No hay categorías destacadas"
                emptyDescription='Agregá categorías usando el botón "Añadir categoría".'
            >
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10" />
                        <TableHead>Nombre</TableHead>
                        <TableHead>Productos</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                {items.map((item, index) => {
                    const cat = item.featurable as Category;

                    return (
                        <FeaturedItemRow
                            key={item.id}
                            item={item}
                            index={index}
                        >
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    {cat.image_url ? (
                                        <img
                                            src={cat.image_url}
                                            alt={cat.name}
                                            className="size-10 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                                            <ImageIcon className="size-4 text-muted-foreground" />
                                        </div>
                                    )}
                                    {cat.name}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary">
                                    {cat.products_count ?? 0}
                                </Badge>
                            </TableCell>
                        </FeaturedItemRow>
                    );
                })}
            </FeaturedItemTable>
        </div>
    );
}
