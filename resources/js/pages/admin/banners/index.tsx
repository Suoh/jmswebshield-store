import { Link, router, usePage } from '@inertiajs/react';
import { Image } from 'lucide-react';
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
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { TableCell, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import type { Banner, PaginatedData } from '@/types';

interface PageProps {
    banners: PaginatedData<Banner>;
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

export default function AdminBannersIndex() {
    const { banners, flash } = usePage<PageProps>().props;
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

    const filtered = banners.data.filter((banner) =>
        banner.name.toLowerCase().includes(search.toLowerCase()),
    );

    const handleDelete = (id: number) => {
        router.delete(`/admin/banners/${id}`, {
            onSuccess: () => toast.success('Banner eliminado.'),
            onError: () => toast.error('Error al eliminar el banner.'),
        });
    };

    const emptyTitle = search
        ? 'No se encontraron banners.'
        : 'No hay banners registrados.';

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Banners</h1>
                <Button asChild>
                    <Link href="/admin/banners/create">Nuevo banner</Link>
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
                columns={[
                    '',
                    'Nombre',
                    'Posición',
                    'Estado',
                    'Link',
                    'Acciones',
                ]}
                colSpan={6}
                emptyTitle={emptyTitle}
                footer={
                    banners.last_page > 1 ? (
                        <Pagination links={banners.links} />
                    ) : null
                }
            >
                {filtered.map((banner) => (
                    <TableRow key={banner.id}>
                        <TableCell>
                            {banner.image_url ? (
                                <img
                                    src={banner.image_url}
                                    alt={banner.name}
                                    className="h-12 w-20 rounded-md object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-20 items-center justify-center rounded-md bg-muted">
                                    <Image className="size-4 text-muted-foreground" />
                                </div>
                            )}
                        </TableCell>
                        <TableCell className="font-medium">
                            {banner.name}
                        </TableCell>
                        <TableCell className="text-center">
                            {banner.position}
                        </TableCell>
                        <TableCell>
                            {banner.is_active ? (
                                <Badge
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-600"
                                >
                                    Activo
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Inactivo</Badge>
                            )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {banner.link_url ?? '—'}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link
                                        href={`/admin/banners/${banner.id}/edit`}
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
                                                    id: banner.id,
                                                    name: banner.name,
                                                })
                                            }
                                        >
                                            Eliminar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Eliminar banner
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                ¿Estás seguro de que deseas
                                                eliminar el banner "
                                                {banner.name}"? Esta acción no
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
