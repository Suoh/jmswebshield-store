import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { TableCell, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import type { SyscomBrand } from '@/types';

const BRANDS_PAGE_SIZE = 25;

interface PageProps {
    syscom_brands: SyscomBrand[];
    imported_syscom_ids: string[];
    [key: string]: unknown;
}

export default function AdminSyscomBrandsIndex() {
    const pageProps = usePage<PageProps>();
    const { syscom_brands, imported_syscom_ids } = pageProps.props;
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [brandsPage, setBrandsPage] = useState(1);
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

    const filtered = syscom_brands.filter((brand) =>
        brand.nombre.toLowerCase().includes(search.toLowerCase()),
    );

    const totalBrandPages = Math.max(
        1,
        Math.ceil(filtered.length / BRANDS_PAGE_SIZE),
    );
    const safePage = Math.min(brandsPage, totalBrandPages);
    const paginatedBrands = filtered.slice(
        (safePage - 1) * BRANDS_PAGE_SIZE,
        safePage * BRANDS_PAGE_SIZE,
    );

    const currentPageIds = paginatedBrands.map((b) => b.id);
    const allCurrentPageSelected =
        currentPageIds.length > 0 &&
        currentPageIds.every((id) => selected.has(id));

    const toggleOne = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }, []);

    const toggleCurrentPage = useCallback(() => {
        setSelected((prev) => {
            const pageIds = paginatedBrands.map((b) => b.id);
            const allSelected =
                pageIds.length > 0 && pageIds.every((id) => prev.has(id));
            const next = new Set(prev);

            if (allSelected) {
                pageIds.forEach((id) => next.delete(id));
            } else {
                pageIds.forEach((id) => next.add(id));
            }

            return next;
        });
    }, [paginatedBrands]);

    const handleImport = () => {
        if (selected.size === 0) {
            return;
        }

        const brandsToImport = filtered
            .filter((b) => selected.has(b.id))
            .map((b) => ({ syscom_id: b.id, name: b.nombre }));

        setIsImporting(true);
        router.post(
            '/admin/syscom/brands/import',
            { brands: brandsToImport },
            {
                onSuccess: () => {
                    setIsImporting(false);
                    setSelected(new Set());
                    router.reload({ only: ['syscom_brands'] });
                },
                onError: () => {
                    setIsImporting(false);
                    toast.error('Error al importar marcas');
                },
            },
        );
    };

    const emptyTitle = search
        ? 'No se encontraron marcas.'
        : 'No hay marcas disponibles.';

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Importar marcas desde SYSCOM
                </h1>
                <div className="flex items-center gap-2">
                    {selected.size > 0 && (
                        <span className="text-sm text-muted-foreground">
                            {selected.size} seleccionada
                            {selected.size > 1 ? 's' : ''}
                        </span>
                    )}
                    <Button
                        onClick={handleImport}
                        disabled={selected.size === 0 || isImporting}
                    >
                        {isImporting ? (
                            <>
                                <Spinner className="mr-2" />
                                Importando...
                            </>
                        ) : selected.size > 0 ? (
                            `Importar ${selected.size} seleccionada${selected.size > 1 ? 's' : ''}`
                        ) : (
                            'Importar'
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <DataTable
                columns={[
                    <Checkbox
                        key="select-all"
                        checked={allCurrentPageSelected}
                        onCheckedChange={toggleCurrentPage}
                    />,
                    'SYSCOM ID',
                    'Nombre',
                    'Estado',
                ]}
                colSpan={4}
                loading={isLoading}
                loadingRows={10}
                emptyTitle={emptyTitle}
                footer={
                    totalBrandPages > 1 ? (
                        <Pagination
                            currentPage={safePage}
                            lastPage={totalBrandPages}
                            onPageChange={setBrandsPage}
                        />
                    ) : null
                }
            >
                {paginatedBrands.map((brand) => {
                    const isImported = imported_syscom_ids.includes(brand.id);
                    const isSelected = selected.has(brand.id);

                    return (
                        <TableRow key={brand.id}>
                            <TableCell>
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleOne(brand.id)}
                                    disabled={isImported}
                                />
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {brand.id}
                            </TableCell>
                            <TableCell
                                className={
                                    isImported
                                        ? 'text-muted-foreground'
                                        : 'font-medium'
                                }
                            >
                                {brand.nombre}
                            </TableCell>
                            <TableCell className="text-center">
                                {isImported ? (
                                    <Badge variant="secondary">
                                        ✓ Importada
                                    </Badge>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        Pendiente
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
