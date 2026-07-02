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
import type { Brand, PaginatedData } from '@/types';

interface PageProps {
    brands: PaginatedData<Brand>;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export default function AdminBrandsIndex() {
    const { brands, flash } = usePage<PageProps>().props;
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

    const filtered = brands.data.filter((brand) =>
        brand.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleDelete = (id: number) => {
        router.delete(`/admin/brands/${id}`, {
            onSuccess: () => {
                toast.success('Marca eliminada.');
            },
            onError: () => {
                toast.error('Error al eliminar la marca.');
            },
        });
    };

    const emptyTitle = search
        ? 'No se encontraron marcas.'
        : 'No hay marcas registradas.';

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Marcas</h1>
                <Button asChild>
                    <Link href="/admin/brands/create">Nueva marca</Link>
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
                    brands.last_page > 1 ? (
                        <Pagination links={brands.links} />
                    ) : null
                }
            >
                {filtered.map((brand) => (
                    <TableRow key={brand.id}>
                        <TableCell className="font-medium">
                            {brand.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                            {brand.slug}
                        </TableCell>
                        <TableCell className="text-center">
                            {brand.products_count}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link
                                        href={`/admin/brands/${brand.id}/edit`}
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
                                                    id: brand.id,
                                                    name: brand.name,
                                                })
                                            }
                                        >
                                            Eliminar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Eliminar marca
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                ¿Estás seguro de que deseas
                                                eliminar la marca "{brand.name}
                                                "? Esta acción no se puede
                                                deshacer.
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
