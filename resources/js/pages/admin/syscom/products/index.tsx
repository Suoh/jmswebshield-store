import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { TableCell, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useToggleAll } from '@/hooks/use-toggle-all';
import { useUrlFilter } from '@/hooks/use-url-filter';
import { formatPrice } from '@/lib/format';
import type { PaginatedData, SyscomCategory, SyscomProduct } from '@/types';

interface PageProps {
    syscom_products: PaginatedData<SyscomProduct>;
    categories: SyscomCategory[];
    brands: Array<{ id: string; nombre: string }>;
    imported_syscom_ids: string[];
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

export default function AdminSyscomProductsIndex() {
    const pageProps = usePage<PageProps>();
    const { syscom_products, categories, brands, imported_syscom_ids } =
        pageProps.props;

    const [prices, setPrices] = useState<Map<string, string>>(new Map());
    const [isImporting, setIsImporting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useFlashToast(
        (
            pageProps as unknown as {
                props: { flash?: { success?: string; error?: string } };
            }
        ).props.flash,
    );

    useEffect(() => {
        const unbindStart = router.on('start', () => setIsLoading(true));
        const unbindFinish = router.on('finish', () => setIsLoading(false));

        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    const [categoriaId, setCategoriaId] = useUrlFilter(
        'categoria_id',
        'all',
        '/admin/syscom/products',
    );
    const [marcaId, setMarcaId] = useUrlFilter(
        'marca_id',
        'all',
        '/admin/syscom/products',
    );
    const [searchUrl, setSearchUrl] = useUrlFilter(
        'search',
        '',
        '/admin/syscom/products',
    );
    const [stock, setStock] = useUrlFilter(
        'stock',
        'all',
        '/admin/syscom/products',
    );

    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    useEffect(() => {
        return () => {
            clearTimeout(debounceRef.current);
        };
    }, []);

    const handleSearchChange = (value: string) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearchUrl(value);
        }, 300);
    };

    const handleCategoriaChange = (value: string) => {
        setCategoriaId(value);
    };

    const handleMarcaChange = (value: string) => {
        setMarcaId(value);
    };

    const handleStockChange = (value: string) => {
        setStock(value);
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', String(newPage));
        const query = params.toString();
        router.get(`/admin/syscom/products${query ? `?${query}` : ''}`);
    };

    const handleClearFilters = () => {
        setCategoriaId('all');
        setMarcaId('all');
        setSearchUrl('');
        setStock('all');
    };

    const handlePriceChange = (id: string, value: string) => {
        const next = new Map(prices);
        next.set(id, value);
        setPrices(next);
    };

    const handleImport = () => {
        if (selected.size === 0) {
            return;
        }

        const productsToImport = displayProducts
            .filter((p) => selected.has(p.id))
            .map((p) => ({
                producto_id: p.id,
                price: parseFloat(prices.get(p.id) || '0'),
            }))
            .filter((p) => p.price > 0);

        if (productsToImport.length === 0) {
            toast.error('Ingresá un precio para al menos un producto');

            return;
        }

        setIsImporting(true);
        router.post(
            '/admin/syscom/products/import',
            {
                products: productsToImport,
            },
            {
                onSuccess: () => {
                    setIsImporting(false);
                    reset();
                    setPrices(new Map());
                    router.reload({ only: ['syscom_products'] });
                },
                onError: () => {
                    setIsImporting(false);
                    toast.error('Error al importar productos');
                },
            },
        );
    };

    const isImported = (id: string) => imported_syscom_ids.includes(id);

    const displayProducts =
        stock === 'false'
            ? syscom_products.data.filter((p) => p.stock === 0)
            : syscom_products.data;

    const { selected, toggleAll, toggleOne, reset } = useToggleAll({
        items: displayProducts,
        getId: (p) => p.id,
    });

    const selectedCount = displayProducts.filter(
        (p) => selected.has(p.id) && !isImported(p.id),
    ).length;

    const hasActiveFilters =
        categoriaId !== 'all' ||
        marcaId !== 'all' ||
        searchUrl !== '' ||
        stock !== 'all';

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Importar productos desde SYSCOM
                </h1>
                <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                        <span className="text-sm text-muted-foreground">
                            {selectedCount} seleccionad
                            {selectedCount > 1 ? 'os' : 'a'}
                        </span>
                    )}
                    <Button
                        onClick={handleImport}
                        disabled={selectedCount === 0 || isImporting}
                    >
                        {isImporting ? (
                            <>
                                <Spinner className="mr-2" />
                                Importando...
                            </>
                        ) : selectedCount > 0 ? (
                            `Importar ${selectedCount} seleccionad${
                                selectedCount > 1 ? 'os' : 'a'
                            }`
                        ) : (
                            'Importar'
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <Select
                    value={categoriaId}
                    onValueChange={handleCategoriaChange}
                >
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            Todas las categorías
                        </SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={marcaId} onValueChange={handleMarcaChange}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Marca" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las marcas</SelectItem>
                        {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                                {brand.nombre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={stock} onValueChange={handleStockChange}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Stock" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Cualquier stock</SelectItem>
                        <SelectItem value="true">En stock</SelectItem>
                        <SelectItem value="false">Sin stock</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    placeholder="Buscar por nombre, ID o modelo..."
                    defaultValue={searchUrl}
                    key={searchUrl}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="max-w-xs"
                />

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearFilters}
                    >
                        Limpiar filtros
                    </Button>
                )}
            </div>

            <DataTable
                columns={[
                    <Checkbox
                        key="select-all"
                        checked={
                            displayProducts.length > 0 &&
                            selected.size === displayProducts.length
                        }
                        onCheckedChange={toggleAll}
                    />,
                    'Img',
                    'Producto',
                    'Stock',
                    'Precio Lista',
                    'Estado',
                    'Tu Precio',
                ]}
                colSpan={7}
                loading={isLoading}
                loadingRows={10}
                emptyTitle="No se encontraron productos."
                scrollHorizontal
                footer={
                    syscom_products.last_page > 1 ? (
                        <>
                            {stock === 'false' && (
                                <div className="text-center text-sm text-muted-foreground">
                                    {displayProducts.length} producto
                                    {displayProducts.length !== 1
                                        ? 's'
                                        : ''}{' '}
                                    sin stock
                                </div>
                            )}
                            <Pagination
                                currentPage={syscom_products.current_page}
                                lastPage={syscom_products.last_page}
                                onPageChange={handlePageChange}
                            />
                        </>
                    ) : null
                }
            >
                {displayProducts.map((product) => {
                    const imported = isImported(product.id);
                    const selectedProduct =
                        selected.has(product.id) && !imported;

                    return (
                        <TableRow
                            key={product.id}
                            className={imported ? 'opacity-60' : undefined}
                        >
                            <TableCell>
                                <Checkbox
                                    checked={selectedProduct}
                                    onCheckedChange={() =>
                                        toggleOne(product.id)
                                    }
                                    disabled={imported}
                                />
                            </TableCell>
                            <TableCell>
                                {product.imagen ? (
                                    <img
                                        src={product.imagen}
                                        alt={product.nombre}
                                        className="h-10 w-10 rounded-md object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                        <span className="text-xs text-muted-foreground">
                                            N/A
                                        </span>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="w-[260px] max-w-[260px]">
                                <div className="flex flex-col gap-0.5">
                                    <span
                                        className={
                                            'line-clamp-2 text-sm font-medium break-words ' +
                                            (imported
                                                ? 'text-muted-foreground'
                                                : '')
                                        }
                                    >
                                        {product.nombre}
                                    </span>
                                    <span className="truncate font-mono text-xs text-muted-foreground">
                                        {product.id}
                                        {product.modelo &&
                                            ` · ${product.modelo}`}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="w-[72px] text-center">
                                <span
                                    className={
                                        product.stock > 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-500'
                                    }
                                >
                                    {product.stock}
                                </span>
                            </TableCell>
                            <TableCell className="w-[110px] text-right">
                                {product.precios ? (
                                    <span className="text-muted-foreground">
                                        {formatPrice(
                                            product.precios.precio_lista,
                                        )}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="w-[100px] text-center">
                                {imported ? (
                                    <Badge variant="secondary">
                                        ✓ Importado
                                    </Badge>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        Pendiente
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="sticky right-0 w-[120px] bg-card text-right">
                                {selectedProduct ? (
                                    <Input
                                        type="number"
                                        placeholder="Precio"
                                        value={prices.get(product.id) ?? ''}
                                        onChange={(e) =>
                                            handlePriceChange(
                                                product.id,
                                                e.target.value,
                                            )
                                        }
                                        className="h-8 w-28 text-right"
                                        min="0"
                                        step="0.01"
                                    />
                                ) : (
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </DataTable>
        </div>
    );
}
