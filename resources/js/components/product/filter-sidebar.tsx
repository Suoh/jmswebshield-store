import { router } from '@inertiajs/react';
import { RotateCcw } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCatalogNavigate } from '@/hooks/use-catalog-url';
import type { Brand } from '@/types/models';

interface FilterSidebarProps {
    brands: Brand[];
}

const readBrandsFromUrl = (): Set<string> => {
    if (typeof window === 'undefined') {
        return new Set();
    }

    const params = new URLSearchParams(window.location.search);
    const ids = new Set<string>();

    params.getAll('brand[]').forEach((v) => ids.add(v));

    for (const [key, value] of params.entries()) {
        if (key.startsWith('brand[') && key.endsWith(']')) {
            ids.add(value);
        }
    }

    return ids;
};

const readPriceFromUrl = (key: string): string => {
    if (typeof window === 'undefined') {
        return '';
    }

    const params = new URLSearchParams(window.location.search);

    return params.get(key) ?? '';
};

export default function FilterSidebar({ brands }: FilterSidebarProps) {
    const navigate = useCatalogNavigate();

    const [selectedBrands, setSelectedBrands] = useState<Set<string>>(() =>
        readBrandsFromUrl(),
    );

    const [priceMin, setPriceMin] = useState(() =>
        readPriceFromUrl('price_min'),
    );
    const [priceMax, setPriceMax] = useState(() =>
        readPriceFromUrl('price_max'),
    );

    const [stock, setStock] = useState(() => {
        if (typeof window === 'undefined') {
            return 'all';
        }

        return (
            new URLSearchParams(window.location.search).get('stock') ?? 'all'
        );
    });

    const applyFilters = useCallback(
        (
            newBrands: Set<string>,
            newPriceMin: string,
            newPriceMax: string,
            newStock: string,
        ) => {
            navigate({
                'brand[]': newBrands.size > 0 ? newBrands : undefined,
                price_min: newPriceMin || undefined,
                price_max: newPriceMax || undefined,
                stock: newStock === 'all' ? undefined : newStock,
            });
        },
        [navigate],
    );

    const handleBrandToggle = (brandId: string) => {
        const newBrands = new Set(selectedBrands);

        if (newBrands.has(brandId)) {
            newBrands.delete(brandId);
        } else {
            newBrands.add(brandId);
        }

        setSelectedBrands(newBrands);
    };

    const handlePriceMinChange = (value: string) => {
        setPriceMin(value);
    };

    const handlePriceMaxChange = (value: string) => {
        setPriceMax(value);
    };

    const handleStockChange = (value: string) => {
        setStock(value);
    };

    const handleApplyFilters = () => {
        applyFilters(selectedBrands, priceMin, priceMax, stock);
    };

    const handleClearAll = () => {
        setSelectedBrands(new Set());
        setPriceMin('');
        setPriceMax('');
        setStock('all');
        router.get('/products');
    };

    const hasActiveFilters =
        selectedBrands.size > 0 ||
        priceMin !== '' ||
        priceMax !== '' ||
        stock !== 'all';

    return (
        <aside className="space-y-6">
            <div>
                <h2 className="mb-3 text-sm font-semibold">Filtros</h2>
                <div className="space-y-4">
                    <div>
                        <Label className="mb-2 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Marca
                        </Label>
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                            {brands.map((brand) => (
                                <label
                                    key={brand.id}
                                    className="group flex cursor-pointer items-center gap-2"
                                >
                                    <Checkbox
                                        checked={selectedBrands.has(
                                            String(brand.id),
                                        )}
                                        onCheckedChange={() =>
                                            handleBrandToggle(String(brand.id))
                                        }
                                    />
                                    <span className="text-sm transition-colors group-hover:text-primary">
                                        {brand.name === 'sinmarca'
                                            ? 'Sin marca'
                                            : brand.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <Label className="mb-2 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Precio
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Mín"
                                value={priceMin}
                                onChange={(e) =>
                                    handlePriceMinChange(e.target.value)
                                }
                                className="h-8 text-sm"
                                min="0"
                            />
                            <span className="text-muted-foreground">—</span>
                            <Input
                                type="number"
                                placeholder="Máx"
                                value={priceMax}
                                onChange={(e) =>
                                    handlePriceMaxChange(e.target.value)
                                }
                                className="h-8 text-sm"
                                min="0"
                            />
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <Label className="mb-2 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Disponibilidad
                        </Label>
                        <div className="space-y-2">
                            <label className="group flex cursor-pointer items-center gap-2">
                                <Checkbox
                                    checked={stock === 'all'}
                                    onCheckedChange={() =>
                                        handleStockChange('all')
                                    }
                                />
                                <span className="text-sm transition-colors group-hover:text-primary">
                                    Todos
                                </span>
                            </label>
                            <label className="group flex cursor-pointer items-center gap-2">
                                <Checkbox
                                    checked={stock === 'in_stock'}
                                    onCheckedChange={() =>
                                        handleStockChange('in_stock')
                                    }
                                />
                                <span className="text-sm transition-colors group-hover:text-primary">
                                    En stock
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="w-full text-muted-foreground hover:text-foreground"
                >
                    <RotateCcw className="mr-2 size-3" />
                    Limpiar filtros
                </Button>
            )}

            <Button
                variant="default"
                size="sm"
                onClick={handleApplyFilters}
                className="w-full"
            >
                Aplicar filtros
            </Button>
        </aside>
    );
}
