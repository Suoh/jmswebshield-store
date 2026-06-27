import { Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import StatusBadge from '@/components/ui/status-badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useUrlFilter } from '@/hooks/use-url-filter';
import { formatPrice } from '@/lib/format';
import type { Brand, PaginatedData, Product } from '@/types';

interface PageProps {
    products: PaginatedData<Product>;
    brands: Brand[];
    filters: {
        search?: string;
        brand_id?: string;
        is_active?: string;
        trashed?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export default function AdminProductsIndex() {
    const { products, brands, filters, flash } = usePage<PageProps>().props;
    const [searchUrl, setSearchUrl] = useUrlFilter(
        'search',
        '',
        '/admin/products',
    );
    const [brandId, setBrandId] = useUrlFilter(
        'brand_id',
        'all',
        '/admin/products',
    );
    const [isActive, setIsActive] = useUrlFilter(
        'is_active',
        'all',
        '/admin/products',
    );
    const [showTrashed, setShowTrashed] = useState(filters.trashed === '1');
    const [deleteTarget, setDeleteTarget] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useFlashToast(flash);

    const handleSearchChange = (value: string) => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            setSearchUrl(value);
        }, 300);
    };

    const clearFilters = () => {
        router.get(
            '/admin/products',
            {},
            { preserveState: true, replace: true },
        );
    };

    const handleRestore = (id: number) => {
        router.post(
            `/admin/products/${id}/restore`,
            {},
            {
                onSuccess: () => {
                    toast.success('Producto restaurado');
                },
                onError: () => {
                    toast.error('Error al restaurar el producto');
                },
            },
        );
    };

    const handleForceDelete = (id: number) => {
        router.delete(`/admin/products/${id}/force`, {
            onSuccess: () => {
                toast.success('Producto eliminado permanentemente');
            },
            onError: () => {
                toast.error('Error al eliminar el producto');
            },
        });
    };

    const confirmDelete = () => {
        if (!deleteTarget) {
            return;
        }

        router.delete(`/admin/products/${deleteTarget.id}`, {
            onSuccess: () => {
                toast.success('Producto eliminado');
                setDeleteTarget(null);
            },
            onError: () => {
                toast.error('Error al eliminar el producto');
                setDeleteTarget(null);
            },
        });
    };

    const hasFilters =
        searchUrl ||
        (brandId && brandId !== 'all') ||
        (isActive && isActive !== 'all') ||
        showTrashed;

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Productos</h1>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={showTrashed}
                            onChange={(e) => {
                                setShowTrashed(e.target.checked);
                                const params = new URLSearchParams(
                                    window.location.search,
                                );

                                if (e.target.checked) {
                                    params.set('trashed', '1');
                                } else {
                                    params.delete('trashed');
                                }

                                params.delete('page');
                                const query = params.toString();
                                router.get(
                                    `/admin/products${query ? `?${query}` : ''}`,
                                    {
                                        preserveState: true,
                                        replace: true,
                                    },
                                );
                            }}
                            className="rounded border-input"
                        />
                        Mostrar eliminados
                    </label>
                    <Button asChild>
                        <Link href="/admin/products/create">
                            Nuevo producto
                        </Link>
                    </Button>
                </div>
            </div>

            <form className="mb-6 flex flex-wrap items-end gap-4">
                <div className="min-w-[200px] flex-1">
                    <Label htmlFor="search" className="sr-only">
                        Buscar
                    </Label>
                    <Input
                        id="search"
                        placeholder="Buscar por nombre..."
                        defaultValue={searchUrl}
                        key={searchUrl}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                <div className="w-[180px]">
                    <Label htmlFor="brand_filter" className="sr-only">
                        Marca
                    </Label>
                    <Select
                        value={brandId}
                        onValueChange={(val) => setBrandId(val)}
                    >
                        <SelectTrigger id="brand_filter">
                            <SelectValue placeholder="Todas las marcas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Todas las marcas
                            </SelectItem>
                            {brands.map((brand) => (
                                <SelectItem
                                    key={brand.id}
                                    value={brand.id.toString()}
                                >
                                    {brand.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[160px]">
                    <Label htmlFor="is_active_filter" className="sr-only">
                        Estado
                    </Label>
                    <Select
                        value={isActive}
                        onValueChange={(val) => setIsActive(val)}
                    >
                        <SelectTrigger id="is_active_filter">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="1">Activos</SelectItem>
                            <SelectItem value="0">Inactivos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {hasFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={clearFilters}
                    >
                        Limpiar
                    </Button>
                )}
            </form>

            <div className="overflow-x-auto rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                            <TableHead className="text-center">
                                Activo
                            </TableHead>
                            <TableHead className="text-right">
                                Acciones
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    No hay productos registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {product.deleted_at && (
                                                <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                                                    Eliminado
                                                </span>
                                            )}
                                            {product.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {product.sku ?? '-'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {product.brand?.name ?? '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatPrice(product.price)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {product.stock}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge
                                            variant={
                                                product.is_active
                                                    ? 'active'
                                                    : 'inactive'
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {!product.deleted_at ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/admin/products/${product.id}/edit`}
                                                        >
                                                            Editar
                                                        </Link>
                                                    </Button>
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
                                                                        {
                                                                            id: product.id,
                                                                            name: product.name,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                Eliminar
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Eliminar
                                                                    producto
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    ¿Estás
                                                                    seguro de
                                                                    que deseas
                                                                    eliminar "
                                                                    {
                                                                        product.name
                                                                    }
                                                                    "? Esta
                                                                    acción no se
                                                                    puede
                                                                    deshacer.
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
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRestore(
                                                                product.id,
                                                            )
                                                        }
                                                    >
                                                        Restaurar
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    '¿Eliminar permanentemente este producto?',
                                                                )
                                                            ) {
                                                                handleForceDelete(
                                                                    product.id,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Eliminar definitivamente
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {products.last_page > 1 && <Pagination links={products.links} />}
        </div>
    );
}
