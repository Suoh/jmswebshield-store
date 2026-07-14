import { router } from '@inertiajs/react';
import { useCallback } from 'react';

export function useUrlFilter(
    key: string,
    defaultValue: string,
    basePath?: string,
) {
    const value =
        typeof window === 'undefined'
            ? defaultValue
            : (new URLSearchParams(window.location.search).get(key) ??
              defaultValue);

    const navigate = useCallback(
        (newValue: string) => {
            const path =
                basePath ??
                (typeof window !== 'undefined'
                    ? window.location.pathname
                    : '/');
            const params = new URLSearchParams(window.location.search);
            params.delete('page');

            if (newValue && newValue !== defaultValue) {
                params.set(key, newValue);
            } else {
                params.delete(key);
            }

            const query = params.toString();
            router.get(
                `${path}${query ? `?${query}` : ''}`,
                {},
                { preserveScroll: true },
            );
        },
        [key, defaultValue, basePath],
    );

    return [value, navigate] as const;
}
