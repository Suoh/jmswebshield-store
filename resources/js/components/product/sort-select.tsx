import { router } from '@inertiajs/react';
import { useMemo } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useUrlFilter } from '@/hooks/use-url-filter';

const SORT_OPTIONS = [
    { value: 'created_at-desc', label: 'Más recientes' },
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
    { value: 'name-asc', label: 'Nombre: A-Z' },
];

export default function SortSelect() {
    const [sortParam] = useUrlFilter('sort', 'created_at');
    const [orderParam] = useUrlFilter('order', 'desc');

    const currentValue = useMemo(
        () => `${sortParam}-${orderParam}`,
        [sortParam, orderParam],
    );

    const handleValueChange = (value: string) => {
        if (!value) {
            return;
        }

        const [newSort, newOrder] = value.split('-');
        const params = new URLSearchParams(window.location.search);
        params.set('sort', newSort);
        params.set('order', newOrder);
        params.delete('page');
        const query = params.toString();
        router.get(
            `/products${query ? `?${query}` : ''}`,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <Select value={currentValue} onValueChange={handleValueChange}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
                {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
