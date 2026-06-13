import { router } from '@inertiajs/react';
import { SearchIcon, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';

export default function SearchBar() {
    const [value, setValue] = useState(() => {
        if (typeof window === 'undefined') {
            return '';
        }

        return new URLSearchParams(window.location.search).get('search') ?? '';
    });
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );

    useEffect(() => {
        return () => clearTimeout(debounceRef.current);
    }, []);

    const applySearch = useCallback((newValue: string) => {
        const params = new URLSearchParams(window.location.search);

        if (newValue) {
            params.set('search', newValue);
        } else {
            params.delete('search');
        }

        params.delete('page');
        const query = params.toString();
        router.get(`/products${query ? `?${query}` : ''}`);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            applySearch(newValue);
        }, 300);
    };

    const handleClear = () => {
        setValue('');
        applySearch('');
    };

    return (
        <div className="relative">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Buscar productos..."
                value={value}
                onChange={handleChange}
                className="pr-9 pl-9"
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Limpiar búsqueda"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}
