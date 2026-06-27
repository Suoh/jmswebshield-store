import { router } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

export function useUrlSetFilter(
    key: string,
    basePath?: string,
): [Set<string>, (newValues: Set<string>) => void] {
    const value = useMemo<Set<string>>(() => {
        if (typeof window === 'undefined') {
            return new Set();
        }

        const params = new URLSearchParams(window.location.search);
        const ids = new Set<string>();

        params.getAll(key).forEach((v) => ids.add(v));

        for (const [k, v] of params.entries()) {
            if (
                k.startsWith(key.replace(/\[\]$/, '') + '[') &&
                k.endsWith(']')
            ) {
                ids.add(v);
            }
        }

        return ids;
    }, [key]);

    const navigate = useCallback(
        (newValues: Set<string>) => {
            const path =
                basePath ??
                (typeof window !== 'undefined'
                    ? window.location.pathname
                    : '/');
            const params = new URLSearchParams(window.location.search);
            params.delete('page');

            const baseKey = key.replace(/\[\]$/, '');
            params.delete(key);

            for (const k of params.keys()) {
                if (k.startsWith(baseKey + '[') && k.endsWith(']')) {
                    params.delete(k);
                }
            }

            if (newValues.size > 0) {
                newValues.forEach((v) => params.append(key, v));
            }

            const query = params.toString();
            router.get(`${path}${query ? `?${query}` : ''}`);
        },
        [key, basePath],
    );

    return [value, navigate] as const;
}
