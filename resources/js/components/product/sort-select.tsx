import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const SORT_OPTIONS = [
    { value: 'created_at-desc', label: 'Más recientes' },
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
    { value: 'name-asc', label: 'Nombre: A-Z' },
];

export default function SortSelect() {
    const [current, setCurrent] = useState(() => {
        if (typeof window === 'undefined') {
            return 'created_at-desc';
        }

        const params = new URLSearchParams(window.location.search);
        const sort = params.get('sort') ?? 'created_at';
        const order = params.get('order') ?? 'desc';

        return `${sort}-${order}`;
    });

    const handleValueChange = (value: string) => {
        if (!value) {
            return;
        }

        setCurrent(value);
        const [newSort, newOrder] = value.split('-');
        const params = new URLSearchParams(window.location.search);
        params.set('sort', newSort);
        params.set('order', newOrder);
        params.delete('page');
        const query = params.toString();
        router.get(`/products${query ? `?${query}` : ''}`);
    };

    return (
        <Select value={current} onValueChange={handleValueChange}>
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
