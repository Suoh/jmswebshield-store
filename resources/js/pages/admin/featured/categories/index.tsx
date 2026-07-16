import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { router, usePage } from '@inertiajs/react';
import { GripVertical, ImageIcon, Plus, X } from 'lucide-react';
import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
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
    const [orderedItems, setOrderedItems] = useState(items);
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

    useFlashToast(flash);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        const reordered = Array.from(orderedItems);
        const [removed] = reordered.splice(result.source.index, 1);
        reordered.splice(result.destination.index, 0, removed);
        setOrderedItems(reordered);

        router.put(
            '/admin/featured/categories/reorder',
            { ids: reordered.map((item) => item.id) },
            {
                preserveScroll: true,
                onError: () => toast.error('Error al reordenar.'),
            },
        );
    };

    const handleAdd = () => {
        const id = Number(selectedCategoryId);

        if (!id) {
            return;
        }

        router.post(
            '/admin/featured/categories',
            { category_id: id } as never,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedCategoryId('');
                    toast.success('Categoría agregada a destacadas.');
                },
                onError: () => {
                    toast.error('Error al agregar la categoría.');
                },
            },
        );
    };

    const confirmDelete = () => {
        if (deleteTarget) {
            router.delete(`/admin/featured/categories/${deleteTarget}`, {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success('Categoría removida de destacadas.'),
                onError: () => toast.error('Error al remover la categoría.'),
            });
            setDeleteTarget(null);
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Categorías destacadas</h1>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Añadir categoría destacada</CardTitle>
                    <CardDescription>
                        Seleccioná una categoría para mostrarla en el carrusel
                        del catálogo público.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-3">
                        <div className="min-w-[250px]">
                            <Select
                                value={selectedCategoryId}
                                onValueChange={setSelectedCategoryId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar categoría..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={String(cat.id)}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleAdd}
                            disabled={!selectedCategoryId}
                        >
                            <Plus className="mr-2 size-4" />
                            Agregar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {orderedItems.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                    <ImageIcon className="size-12" />
                    <p className="text-lg font-medium">
                        No hay categorías destacadas
                    </p>
                    <p className="text-sm">
                        Agregá categorías usando el selector de arriba.
                    </p>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="featured-categories">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10" />
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Productos</TableHead>
                                            <TableHead className="text-right">
                                                Acciones
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orderedItems.map((item, index) => {
                                            const cat =
                                                item.featurable as Category;

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
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-3">
                                                                    {cat.image_url ? (
                                                                        <img
                                                                            src={
                                                                                cat.image_url
                                                                            }
                                                                            alt={
                                                                                cat.name
                                                                            }
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
                                                                    {cat.products_count ??
                                                                        0}
                                                                </Badge>
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
                                                                                categoría
                                                                                destacada
                                                                            </AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                ¿Estás
                                                                                seguro
                                                                                de
                                                                                que
                                                                                deseas
                                                                                quitar
                                                                                la
                                                                                categoría
                                                                                "
                                                                                {
                                                                                    cat.name
                                                                                }
                                                                                "
                                                                                del
                                                                                carrusel
                                                                                de
                                                                                destacadas?
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
