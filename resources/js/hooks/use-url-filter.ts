import { router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

export function useUrlFilter(key: string, defaultValue: string) {
    const value = useMemo<string>(() => {
        if (typeof window === 'undefined') {
            return defaultValue;
        }

        const params = new URLSearchParams(window.location.search);
        const val = params.get(key);

        return val ?? defaultValue;
    }, [key, defaultValue]);

    const navigate = useCallback(
        (newValue: string) => {
            const params = new URLSearchParams(window.location.search);
            params.delete('page');

            if (newValue && newValue !== defaultValue) {
                params.set(key, newValue);
            } else {
                params.delete(key);
            }

            const query = params.toString();
            router.get(`/products${query ? `?${query}` : ''}`);
        },
        [key, defaultValue],
    );

    return [value, navigate] as const;
}
