import { Link, router, usePage } from '@inertiajs/react';
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
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { TableCell, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import type { Category, PaginatedData } from '@/types';

interface PageProps {
    categories: PaginatedData<Category>;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export default function AdminCategoriesIndex() {
    const { categories, flash } = usePage<PageProps>().props;
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState<{
        id: number;
        name: string;
    } | null>(null);

    useFlashToast(flash);

    const confirmDelete = () => {
        if (deleteTarget) {
            handleDelete(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    const filtered = categories.data.filter((category) =>
        category.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleDelete = (id: number) => {
        router.delete(`/admin/categories/${id}`, {
            onSuccess: () => {
                toast.success('Categoría eliminada.');
            },
            onError: () => {
                toast.error('Error al eliminar la categoría.');
            },
        });
    };

    const emptyTitle = search
        ? 'No se encontraron categorías.'
        : 'No hay categorías registradas.';

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Categorías</h1>
                <Button asChild>
                    <Link href="/admin/categories/create">Nueva categoría</Link>
                </Button>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <DataTable
                columns={['Nombre', 'Slug', 'Productos', 'Acciones']}
                colSpan={4}
                emptyTitle={emptyTitle}
                footer={
                    categories.last_page > 1 ? (
                        <Pagination
                            links={categories.links}
                            currentPage={categories.current_page}
                            lastPage={categories.last_page}
                        />
                    ) : null
                }
            >
                {filtered.map((category) => (
                    <TableRow key={category.id}>
                        <TableCell className="font-medium">
                            {category.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            {category.slug}
                        </TableCell>
                        <TableCell className="text-center">
                            {category.products_count}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link
                                        href={`/admin/categories/${category.id}/edit`}
                                    >
                                        Editar
                                    </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() =>
                                                setDeleteTarget({
                                                    id: category.id,
                                                    name: category.name,
                                                })
                                            }
                                        >
                                            Eliminar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Eliminar categoría
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                ¿Estás seguro de que deseas
                                                eliminar la categoría "
                                                {category.name}"? Esta acción no
                                                se puede deshacer.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Cancelar
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={confirmDelete}
                                            >
                                                Eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </DataTable>
        </div>
    );
}
