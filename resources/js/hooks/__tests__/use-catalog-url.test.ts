import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRouterGet = vi.fn();

vi.mock('@inertiajs/react', () => ({
    router: {
        get: (...args: unknown[]) => mockRouterGet(...args),
    },
}));

import { buildCatalogUrl, useCatalogNavigate } from '@/hooks/use-catalog-url';

describe('buildCatalogUrl', () => {
    beforeEach(() => {
        vi.stubGlobal('window', {
            location: {
                search: '',
            },
        });
    });

    it('returns /products when no overrides', () => {
        expect(buildCatalogUrl({})).toBe('/products');
    });

    it('builds URL with string params', () => {
        expect(buildCatalogUrl({ price_min: '100', price_max: '500' })).toBe(
            '/products?price_min=100&price_max=500',
        );
    });

    it('deletes param when value is undefined', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?price_min=100&search=test',
            },
        });

        const url = buildCatalogUrl({ price_min: undefined });
        expect(url).not.toContain('price_min=');
        expect(url).toContain('search=test');
    });

    it('deletes param when value is empty string', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?search=old',
            },
        });

        const url = buildCatalogUrl({ search: '' });
        expect(url).not.toContain('search=');
    });

    it('builds URL with Set of values', () => {
        const brands = new Set(['1', '3', '5']);

        const url = buildCatalogUrl({ 'brand[]': brands });
        expect(url).toContain('brand%5B%5D=1');
        expect(url).toContain('brand%5B%5D=3');
        expect(url).toContain('brand%5B%5D=5');
    });

    it('skips empty Set', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?sort=name-asc',
            },
        });

        const url = buildCatalogUrl({ 'brand[]': new Set() });
        expect(url).not.toContain('brand');
        expect(url).toContain('sort=name-asc');
    });

    it('deletes page param from existing URL', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?page=5&sort=name-asc',
            },
        });

        const url = buildCatalogUrl({});
        expect(url).not.toContain('page=');
        expect(url).toContain('sort=name-asc');
    });
});

describe('useCatalogNavigate', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('window', {
            location: {
                search: '',
            },
        });
    });

    it('returns a function that calls router.get with built URL', () => {
        const navigate = useCatalogNavigate();

        navigate({ price_min: '200' });

        expect(mockRouterGet).toHaveBeenCalledWith(
            expect.stringContaining('price_min=200'),
        );
    });

    it('preserves existing URL params and overrides specified ones', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?search=test&sort=name-asc&page=2',
            },
        });

        const navigate = useCatalogNavigate();

        navigate({ price_min: '100' });

        const url = mockRouterGet.mock.calls[0][0];
        expect(url).toContain('search=test');
        expect(url).toContain('sort=name-asc');
        expect(url).toContain('price_min=100');
        expect(url).not.toContain('page=');
    });
});
