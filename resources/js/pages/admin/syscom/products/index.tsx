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

    const [categoriaId, setCategoriaId] = useState('all');
    const [marcaId, setMarcaId] = useState('all');
    const [search, setSearch] = useState('');
    const [stock, setStock] = useState('all');

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setCategoriaId(
            params.get('categoria_id') ?? categories[0]?.id ?? 'all',
        );
        setMarcaId(params.get('marca_id') ?? 'all');
        setSearch(params.get('search') ?? '');
        setStock(params.get('stock') ?? 'all');
    }, [categories]);
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelected(new Set());
    }, [syscom_products.data]);

    const filtered = syscom_products.data.filter((product) => {
        const matchesSearch =
            !search ||
            product.nombre.toLowerCase().includes(search.toLowerCase()) ||
            product.id.toLowerCase().includes(search.toLowerCase()) ||
            (product.modelo ?? '').toLowerCase().includes(search.toLowerCase());

        return matchesSearch;
    });

    const applyFilters = (
        newCategoriaId: string,
        newMarcaId: string,
        newSearch: string,
        newStock: string,
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

        const query = params.toString();
        router.get(`/admin/syscom/products${query ? `?${query}` : ''}`);
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

    const handleSearchChange = (value: string) => {
        setSearch(value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            applyFilters(categoriaId, marcaId, search, stock);
        }
    };

    const toggleAll = () => {
        setSelected((prev) => {
            if (prev.size === filtered.length) {
                return new Set();
            }

            return new Set(filtered.map((p) => p.id));
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

        const productsToImport = filtered
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

    const selectedCount = filtered.filter(
        (p) => selected.has(p.id) && !isImported(p.id),
    ).length;

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Importar productos desde SYSCOM
                </h1>
                <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                        <span className="text-sm text-muted-foreground">
                            {selectedCount} selected
                            {selectedCount > 1 ? 's' : ''}
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
                            `Importar ${selectedCount} seleccionada${selectedCount > 1 ? 's' : ''}`
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
                    <SelectTrigger className="w-36">
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
                    onKeyDown={handleSearchKeyDown}
                    className="max-w-xs"
                />
            </div>

            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <Checkbox
                                    checked={
                                        filtered.length > 0 &&
                                        selected.size === filtered.length
                                    }
                                    onCheckedChange={toggleAll}
                                />
                            </TableHead>
                            <TableHead className="w-16">Img</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                            <TableHead className="text-right">
                                Precio Lista
                            </TableHead>
                            <TableHead className="text-center">
                                Estado
                            </TableHead>
                            <TableHead className="w-32 text-right">
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
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    {search ||
                                    categoriaId !== 'all' ||
                                    marcaId !== 'all'
                                        ? 'No se encontraron productos.'
                                        : 'No hay productos disponibles.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((product) => {
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
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span
                                                    className={
                                                        imported
                                                            ? 'font-normal text-muted-foreground'
                                                            : 'font-medium'
                                                    }
                                                >
                                                    {product.nombre}
                                                </span>
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {product.id}
                                                    {product.modelo &&
                                                        ` · ${product.modelo}`}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
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
                                        <TableCell className="text-right">
                                            {product.precios ? (
                                                <span className="text-muted-foreground">
                                                    $
                                                    {Number(
                                                        product.precios
                                                            .precio_lista,
                                                    ).toLocaleString('es-MX', {
                                                        minimumFractionDigits: 2,
                                                    })}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
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
                                        <TableCell className="text-right">
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
                <div className="flex items-center justify-center gap-2">
                    {syscom_products.links.map((link, i) => (
                        <Button
                            key={i}
                            variant={link.active ? 'default' : 'ghost'}
                            size="sm"
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
