import { router } from '@inertiajs/react';
import { SearchIcon, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

export default function SearchBar() {
    const [value, setValue] = useState(() => {
        if (typeof window === 'undefined') {
            return '';
        }

        return new URLSearchParams(window.location.search).get('search') ?? '';
    });

    const debouncedValue = useDebounce(value, 500);

    const navigate = useCallback((newValue: string) => {
        const params = new URLSearchParams(window.location.search);

        if (newValue) {
            params.set('search', newValue);
        } else {
            params.delete('search');
        }

        params.delete('page');
        const query = params.toString();
        router.get(
            `/products${query ? `?${query}` : ''}`,
            {},
            { preserveScroll: true },
        );
    }, []);

    useEffect(() => {
        const urlValue =
            typeof window !== 'undefined'
                ? (new URLSearchParams(window.location.search).get('search') ??
                  '')
                : '';

        if (debouncedValue !== urlValue) {
            navigate(debouncedValue);
        }
    }, [debouncedValue, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    const handleClear = () => {
        setValue('');
        navigate('');
    };

    return (
        <div className="relative">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="text"
                role="searchbox"
                aria-label="Buscar productos..."
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
