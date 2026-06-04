import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { PaginatedData, Product, Brand } from '@/types/models';

interface PageProps {
    products: PaginatedData<Product>;
    brands: Brand[];
    filters: {
        search?: string;
        brand_id?: string;
        is_active?: string;
    };
    [key: string]: unknown;
}

export default function AdminProductsIndex() {
    const { products, brands, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [brandId, setBrandId] = useState(filters.brand_id ?? 'all');
    const [isActive, setIsActive] = useState(filters.is_active ?? 'all');

    const applyFilters = (
        newSearch?: string,
        newBrandId?: string,
        newIsActive?: string,
    ) => {
        const params: Record<string, string> = {};

        if (newSearch !== undefined && newSearch) {
            params.search = newSearch;
        }

        if (newBrandId !== undefined && newBrandId && newBrandId !== 'all') {
            params.brand_id = newBrandId;
        }

        if (newIsActive !== undefined && newIsActive && newIsActive !== 'all') {
            params.is_active = newIsActive;
        }

        router.get('/admin/products', params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters(search, brandId, isActive);
    };

    const handleDelete = (id: number, name: string) => {
        if (!confirm(`Eliminar el producto "${name}"?`)) {
            return;
        }

        router.delete(`/admin/products/${id}`);
    };

    const clearFilters = () => {
        setSearch('');
        setBrandId('all');
        setIsActive('all');
        router.get(
            '/admin/products',
            {},
            { preserveState: true, replace: true },
        );
    };

    const hasFilters =
        search ||
        (brandId && brandId !== 'all') ||
        (isActive && isActive !== 'all');

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Productos</h1>
                <Button asChild>
                    <Link href="/admin/products/create">Nuevo producto</Link>
                </Button>
            </div>

            <form
                onSubmit={handleSearchSubmit}
                className="mb-6 flex flex-wrap items-end gap-4"
            >
                <div className="min-w-[200px] flex-1">
                    <Label htmlFor="search" className="sr-only">
                        Buscar
                    </Label>
                    <Input
                        id="search"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="w-[180px]">
                    <Label htmlFor="brand_filter" className="sr-only">
                        Marca
                    </Label>
                    <Select
                        value={brandId}
                        onValueChange={(val) => {
                            setBrandId(val);
                            applyFilters(search, val, isActive);
                        }}
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
                        onValueChange={(val) => {
                            setIsActive(val);
                            applyFilters(search, brandId, val);
                        }}
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

                <Button type="submit">Filtrar</Button>
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

            <div className="overflow-hidden rounded-lg border">
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
                                        {product.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {product.sku ?? '-'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {product.brand?.name ?? '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ${parseFloat(product.price).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {product.stock}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                product.is_active
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                            }`}
                                        >
                                            {product.is_active ? 'Sí' : 'No'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
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
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    handleDelete(
                                                        product.id,
                                                        product.name,
                                                    )
                                                }
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {products.last_page > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                    {products.links.map((link, i) => (
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
