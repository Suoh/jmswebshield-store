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
import { DataTable } from '@/components/ui/data-table';
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
import { TableCell, TableRow } from '@/components/ui/table';
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
    const { url } = usePage();

    return <AdminProductsList key={url} />;
}

function AdminProductsList() {
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

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [installmentOption, setInstallmentOption] = useState('none');
    const [savingInstallments, setSavingInstallments] = useState(false);
    const [installmentError, setInstallmentError] = useState('');
    const selectableIds = products.data
        .filter((product) => !product.deleted_at)
        .map((product) => product.id);

    const applyInstallments = () => {
        setSavingInstallments(true);
        setInstallmentError('');
        router.patch(
            '/admin/products/installments',
            {
                product_ids: selectedIds,
                msi_3_months:
                    installmentOption === '3' || installmentOption === 'both',
                msi_6_months:
                    installmentOption === '6' || installmentOption === 'both',
            },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([]),
                onError: (errors) =>
                    setInstallmentError(Object.values(errors).join(' ')),
                onFinish: () => setSavingInstallments(false),
            },
        );
    };

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

            {selectedIds.length > 0 && (
                <div className="mb-4 space-y-2">
                    <div className="flex flex-wrap items-end gap-3">
                        <span className="text-sm">
                            {selectedIds.length} productos seleccionados
                        </span>
                        <div className="space-y-1">
                            <Label htmlFor="bulk-installments">
                                Meses sin intereses
                            </Label>
                            <select
                                id="bulk-installments"
                                value={installmentOption}
                                onChange={(event) =>
                                    setInstallmentOption(event.target.value)
                                }
                                disabled={savingInstallments}
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="none">Ninguno</option>
                                <option value="3">3 meses</option>
                                <option value="6">6 meses</option>
                                <option value="both">3 y 6 meses</option>
                            </select>
                        </div>
                        <Button
                            onClick={applyInstallments}
                            disabled={savingInstallments}
                        >
                            {savingInstallments
                                ? 'Aplicando…'
                                : 'Aplicar a seleccionados'}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Esta opción reemplazará los plazos de todos los
                        productos seleccionados.
                    </p>
                    {installmentError && (
                        <p role="alert" className="text-sm text-destructive">
                            {installmentError}
                        </p>
                    )}
                </div>
            )}

            <DataTable
                columns={[
                    <input
                        key="select-page"
                        type="checkbox"
                        aria-label="Seleccionar todos los productos de esta página"
                        disabled={
                            savingInstallments || selectableIds.length === 0
                        }
                        checked={
                            selectableIds.length > 0 &&
                            selectableIds.every((id) =>
                                selectedIds.includes(id),
                            )
                        }
                        ref={(element) => {
                            if (element) {
                                element.indeterminate =
                                    selectedIds.length > 0 &&
                                    selectedIds.length < selectableIds.length;
                            }
                        }}
                        onChange={(event) =>
                            setSelectedIds(
                                event.target.checked ? selectableIds : [],
                            )
                        }
                    />,
                    'Nombre',
                    'Marca',
                    'Precio',
                    'Stock',
                    'Activo',
                    'Acciones',
                ]}
                colSpan={7}
                emptyTitle="No hay productos registrados."
                scrollHorizontal
                footer={
                    products.last_page > 1 ? (
                        <Pagination
                            links={products.links}
                            currentPage={products.current_page}
                            lastPage={products.last_page}
                        />
                    ) : null
                }
            >
                {products.data.map((product) => (
                    <TableRow key={product.id}>
                        <TableCell>
                            <input
                                type="checkbox"
                                aria-label={`Seleccionar ${product.name}`}
                                checked={selectedIds.includes(product.id)}
                                disabled={
                                    savingInstallments || !!product.deleted_at
                                }
                                onChange={(event) =>
                                    setSelectedIds((ids) =>
                                        event.target.checked
                                            ? [...ids, product.id]
                                            : ids.filter(
                                                  (id) => id !== product.id,
                                              ),
                                    )
                                }
                            />
                        </TableCell>
                        <TableCell className="min-w-0 font-medium">
                            <div className="flex max-w-sm items-center gap-2">
                                {product.deleted_at && (
                                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-xs text-destructive">
                                        Eliminado
                                    </span>
                                )}
                                <span className="truncate" title={product.name}>
                                    {product.name}
                                </span>
                            </div>
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
                                    product.is_active ? 'active' : 'inactive'
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
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            id: product.id,
                                                            name: product.name,
                                                        })
                                                    }
                                                >
                                                    Eliminar
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Eliminar producto
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        ¿Estás seguro de que
                                                        deseas eliminar "
                                                        {product.name}"? Esta
                                                        acción no se puede
                                                        deshacer.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancelar
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive text-destructive-foreground hover:bg-[color-mix(in_oklch,var(--destructive),var(--foreground)_10%)]"
                                                        onClick={confirmDelete}
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
                                                handleRestore(product.id)
                                            }
                                        >
                                            Restaurar
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteTarget({
                                                            id: product.id,
                                                            name: product.name,
                                                        })
                                                    }
                                                >
                                                    Eliminar definitivamente
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Eliminar definitivamente
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        ¿Eliminar
                                                        permanentemente "
                                                        {product.name}"? Esta
                                                        acción no se puede
                                                        deshacer.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancelar
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-destructive text-destructive-foreground hover:bg-[color-mix(in_oklch,var(--destructive),var(--foreground)_10%)]"
                                                        onClick={() => {
                                                            if (deleteTarget) {
                                                                handleForceDelete(
                                                                    deleteTarget.id,
                                                                );
                                                                setDeleteTarget(
                                                                    null,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Eliminar permanentemente
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </DataTable>
        </div>
    );
}
