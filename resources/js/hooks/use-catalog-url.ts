import { router } from '@inertiajs/react';

export function buildCatalogUrl(
    overrides: Record<string, string | string[] | Set<string> | undefined>,
): string {
    const params = new URLSearchParams(window.location.search);
    params.delete('page');

    for (const [key, value] of Object.entries(overrides)) {
        params.delete(key);

        if (key === 'brand[]' && (value === undefined || value === '')) {
            for (const k of params.keys()) {
                if (k.startsWith('brand[') && k.endsWith(']')) {
                    params.delete(k);
                }
            }
        }

        if (value === undefined || value === '') {
            continue;
        }

        if (value instanceof Set) {
            if (value.size === 0) {
                continue;
            }

            value.forEach((v) => params.append(key, v));
        } else if (Array.isArray(value)) {
            if (value.length === 0) {
                continue;
            }

            value.forEach((v) => params.append(key, v));
        } else {
            params.set(key, value);
        }
    }

    const query = params.toString();

    return `/products${query ? `?${query}` : ''}`;
}

export function useCatalogNavigate() {
    return (
        overrides: Record<string, string | string[] | Set<string> | undefined>,
    ) => {
        router.get(buildCatalogUrl(overrides));
    };
}
