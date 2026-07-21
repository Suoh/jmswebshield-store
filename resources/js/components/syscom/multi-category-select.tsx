import { ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface Props {
    categories: Array<{ id: string; nombre: string }>;
    selected: string[];
    onChange: (ids: string[]) => void;
}

export function MultiCategorySelect({ categories, selected, onChange }: Props) {
    const toggle = (id: string) => {
        onChange(
            selected.includes(id)
                ? selected.filter((s) => s !== id)
                : [...selected, id],
        );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-64 justify-between"
                >
                    <span className="truncate">
                        {selected.length === 0
                            ? 'Ninguna categoría'
                            : selected.length === 1
                              ? (categories.find((c) => c.id === selected[0])
                                    ?.nombre ?? '1 categoría')
                              : `${selected.length} categorías`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
                <div className="space-y-1">
                    {categories.length === 0 && (
                        <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                            No hay categorías disponibles
                        </p>
                    )}
                    {categories.map((cat) => (
                        <label
                            key={cat.id}
                            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                        >
                            <Checkbox
                                checked={selected.includes(cat.id)}
                                onCheckedChange={() => toggle(cat.id)}
                            />
                            <span className="text-sm">{cat.nombre}</span>
                        </label>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
