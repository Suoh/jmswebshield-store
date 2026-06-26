import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatPrice } from '@/lib/format';
import type { PaginatedData } from '@/types/models';

interface SyscomProduct {
    id: string;
    nombre: string;
    descripcion_corta: string | null;
    stock: number;
    modelo: string | null;
    marca_id: string | null;
    precios: {
        precio_lista: number;
        precio_descuento: number | null;
    } | null;
    imagen: string | null;
}

interface PageProps {
    syscom_products: PaginatedData<SyscomProduct>;
    categories: Array<{ id: string; nombre: string }>;
    brands: Array<{ id: string; nombre: string }>;
    imported_syscom_ids: string[];
    flash?: { success?: string; error?: string };
    [key: string]: unknown;
}

export default function AdminSyscomProductsIndex() {
    const pageProps = usePage<PageProps>();
    const { syscom_products, categories, brands, imported_syscom_ids } =
        pageProps.props;

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [prices, setPrices] = useState<Map<string, string>>(new Map());
    const [isImporting, setIsImporting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const prevFlash = useRef<string | null>(null);

    useEffect(() => {
        const unbindStart = router.on('start', () => setIsLoading(true));
        const unbindFinish = router.on('finish', () => setIsLoading(false));

        return () => {
            unbindStart();
            unbindFinish();
        };
    }, []);

    useEffect(() => {
        const { flash } = pageProps as unknown as {
            flash: { success?: string; error?: string };
        };

        if (flash.success && flash.success !== prevFlash.current) {
            prevFlash.current = flash.success;
            toast.success(flash.success);
        }
    }, [pageProps]);

    const [categoriaId, setCategoriaId] = useState(() => {
        if (typeof window === 'undefined') {
            return 'all';
        }

        const params = new URLSearchParams(window.location.search);

        return params.get('categoria_id') ?? 'all';
    });
    const [marcaId, setMarcaId] = useState(() => {
        if (typeof window === 'undefined') {
            return 'all';
        }

        const params = new URLSearchParams(window.location.search);

        return params.get('marca_id') ?? 'all';
    });
    const [search, setSearch] = useState(() => {
        if (typeof window === 'undefined') {
            return '';
        }

        const params = new URLSearchParams(window.location.search);

        return params.get('search') ?? '';
    });
    const [stock, setStock] = useState(() => {
        if (typeof window === 'undefined') {
            return 'all';
        }

        const params = new URLSearchParams(window.location.search);

        return params.get('stock') ?? 'all';
    });

    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    useEffect(() => {
        return () => {
            clearTimeout(debounceRef.current);
        };
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelected(new Set());
    }, [syscom_products.data]);

    const applyFilters = (
        newCategoriaId: string,
        newMarcaId: string,
        newSearch: string,
        newStock: string,
        newPage: number = 1,
    ) => {
        const params = new URLSearchParams();

        if (newCategoriaId && newCategoriaId !== 'all') {
            params.set('categoria_id', newCategoriaId);
        }

        if (newMarcaId && newMarcaId !== 'all') {
            params.set('marca_id', newMarcaId);
        }

        if (newSearch) {
            params.set('search', newSearch);
        }

        if (newStock && newStock !== 'all') {
            params.set('stock', newStock);
        }

        if (newPage > 1) {
            params.set('page', String(newPage));
        }

        const query = params.toString();
        router.get(`/admin/syscom/products${query ? `?${query}` : ''}`);
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            applyFilters(categoriaId, marcaId, value, stock);
        }, 300);
    };

    const handleCategoriaChange = (value: string) => {
        setCategoriaId(value);
        applyFilters(value, marcaId, search, stock);
    };

    const handleMarcaChange = (value: string) => {
        setMarcaId(value);
        applyFilters(categoriaId, value, search, stock);
    };

    const handleStockChange = (value: string) => {
        setStock(value);
        applyFilters(categoriaId, marcaId, search, value);
    };

    const handlePageChange = (newPage: number) => {
        applyFilters(categoriaId, marcaId, search, stock, newPage);
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategoriaId('all');
        setMarcaId('all');
        setStock('all');
        router.get('/admin/syscom/products');
    };

    const toggleAll = () => {
        const currentData = displayProducts;
        setSelected((prev) => {
            if (prev.size === currentData.length) {
                return new Set();
            }

            return new Set(currentData.map((p) => p.id));
        });
    };

    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
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
                    setSelected(new Set());
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

    const selectedCount = displayProducts.filter(
        (p) => selected.has(p.id) && !isImported(p.id),
    ).length;

    const hasActiveFilters =
        categoriaId !== 'all' ||
        marcaId !== 'all' ||
        search !== '' ||
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
                    value={search}
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

            <div className="overflow-x-auto rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <Checkbox
                                    checked={
                                        displayProducts.length > 0 &&
                                        selected.size === displayProducts.length
                                    }
                                    onCheckedChange={toggleAll}
                                />
                            </TableHead>
                            <TableHead className="w-14">Img</TableHead>
                            <TableHead className="w-[260px]">
                                Producto
                            </TableHead>
                            <TableHead className="w-[72px] text-center">
                                Stock
                            </TableHead>
                            <TableHead className="w-[110px] text-right">
                                Precio Lista
                            </TableHead>
                            <TableHead className="w-[100px] text-center">
                                Estado
                            </TableHead>
                            <TableHead className="sticky right-0 w-[120px] bg-card text-right">
                                Tu Precio
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Skeleton className="h-4 w-4" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-10 w-10 rounded-md" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Skeleton className="mx-auto h-4 w-8" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Skeleton className="ml-auto h-4 w-20" />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Skeleton className="mx-auto h-4 w-16" />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Skeleton className="ml-auto h-8 w-28" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : displayProducts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    No se encontraron productos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayProducts.map((product) => {
                                const imported = isImported(product.id);
                                const selectedProduct =
                                    selected.has(product.id) && !imported;

                                return (
                                    <TableRow
                                        key={product.id}
                                        className={
                                            imported ? 'opacity-60' : undefined
                                        }
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
                                                        product.precios
                                                            .precio_lista,
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
                                                    value={
                                                        prices.get(
                                                            product.id,
                                                        ) ?? ''
                                                    }
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
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {syscom_products.last_page > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={syscom_products.current_page <= 1}
                        onClick={() =>
                            handlePageChange(syscom_products.current_page - 1)
                        }
                    >
                        Anterior
                    </Button>
                    {stock === 'false' ? (
                        <span className="text-sm text-muted-foreground">
                            {displayProducts.length} producto
                            {displayProducts.length !== 1 ? 's' : ''} sin stock
                        </span>
                    ) : (
                        <span className="text-sm text-muted-foreground">
                            {syscom_products.current_page} de{' '}
                            {syscom_products.last_page}
                        </span>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={
                            syscom_products.current_page >=
                            syscom_products.last_page
                        }
                        onClick={() =>
                            handlePageChange(syscom_products.current_page + 1)
                        }
                    >
                        Siguiente
                    </Button>
                </div>
            )}
        </div>
    );
}
