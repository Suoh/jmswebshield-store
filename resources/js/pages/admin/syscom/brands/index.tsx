import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
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

interface SyscomBrand {
    id: string;
    nombre: string;
}

interface PageProps {
    syscom_brands: PaginatedData<SyscomBrand>;
    imported_syscom_ids: string[];
    [key: string]: unknown;
}

export default function AdminSyscomBrandsIndex() {
    const { syscom_brands, imported_syscom_ids } = usePage<PageProps>().props;
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const filtered = syscom_brands.data.filter((brand) =>
        brand.nombre.toLowerCase().includes(search.toLowerCase()),
    );

    const toggleAll = () => {
        if (selected.size === filtered.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map((b) => b.id)));
        }
    };

    const toggleOne = (id: string) => {
        const next = new Set(selected);

        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }

        setSelected(next);
    };

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
                    router.reload({
                        only: ['syscom_brands', 'imported_syscom_ids'],
                    });
                    toast.success(
                        `${brandsToImport.length} marca${brandsToImport.length > 1 ? 's' : ''} importada${brandsToImport.length > 1 ? 's' : ''}`,
                    );
                },
                onError: () => {
                    setIsImporting(false);
                    toast.error('Error al importar marcas');
                },
            },
        );
    };

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
                            <TableHead>SYSCOM ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="text-center">
                                Estado
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="py-8 text-center text-muted-foreground"
                                >
                                    {search
                                        ? 'No se encontraron marcas.'
                                        : 'No hay marcas disponibles.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((brand) => {
                                const isImported = imported_syscom_ids.includes(
                                    brand.id,
                                );
                                const isSelected = selected.has(brand.id);

                                return (
                                    <TableRow key={brand.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() =>
                                                    toggleOne(brand.id)
                                                }
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
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {syscom_brands.last_page > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {syscom_brands.links.map((link, i) => (
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
