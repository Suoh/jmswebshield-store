import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { TableCell, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { useToggleAll } from '@/hooks/use-toggle-all';
import type { SyscomCategory } from '@/types';

interface PageProps {
    syscom_categories: SyscomCategory[];
    imported_syscom_ids: string[];
    [key: string]: unknown;
}

export default function AdminSyscomCategoriesIndex() {
    const pageProps = usePage<PageProps>();
    const { syscom_categories, imported_syscom_ids } = pageProps.props;
    const [search, setSearch] = useState('');
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

    const filtered = syscom_categories.filter((cat) =>
        cat.nombre.toLowerCase().includes(search.toLowerCase()),
    );

    const { selected, toggleAll, toggleOne, reset } = useToggleAll({
        items: filtered,
        getId: (c) => c.id,
    });

    const handleImport = () => {
        if (selected.size === 0) {
            return;
        }

        const categoriesToImport = filtered
            .filter((c) => selected.has(c.id))
            .map((c) => ({ syscom_id: c.id, name: c.nombre }));

        setIsImporting(true);
        router.post(
            '/admin/syscom/categories/import',
            { categories: categoriesToImport },
            {
                onSuccess: () => {
                    setIsImporting(false);
                    reset();
                    router.reload({ only: ['syscom_categories'] });
                },
                onError: () => {
                    setIsImporting(false);
                    toast.error('Error al importar categorías');
                },
            },
        );
    };

    const emptyTitle = search
        ? 'No se encontraron categorías.'
        : 'No hay categorías disponibles.';

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Importar categorías desde SYSCOM
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
                        checked={
                            filtered.length > 0 &&
                            selected.size === filtered.length
                        }
                        onCheckedChange={toggleAll}
                    />,
                    'SYSCOM ID',
                    'Nombre',
                    'Estado',
                ]}
                colSpan={4}
                loading={isLoading}
                loadingRows={10}
                emptyTitle={emptyTitle}
            >
                {filtered.map((cat) => {
                    const isImported = imported_syscom_ids.includes(cat.id);
                    const isSelected = selected.has(cat.id);

                    return (
                        <TableRow key={cat.id}>
                            <TableCell>
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => toggleOne(cat.id)}
                                    disabled={isImported}
                                />
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {cat.id}
                            </TableCell>
                            <TableCell
                                className={
                                    isImported
                                        ? 'text-muted-foreground'
                                        : 'font-medium'
                                }
                            >
                                {cat.nombre}
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
