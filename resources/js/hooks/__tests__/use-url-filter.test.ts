import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRouterGet = vi.fn();

vi.mock('@inertiajs/react', () => ({
    router: {
        get: (...args: unknown[]) => mockRouterGet(...args),
    },
}));

import { useUrlFilter } from '@/hooks/use-url-filter';

describe('useUrlFilter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('window', {
            location: {
                search: '',
            },
        });
    });

    it('returns default value when no URL param is present', () => {
        const { result } = renderHook(() => useUrlFilter('view', 'grid'));

        const [value] = result.current;
        expect(value).toBe('grid');
    });

    it('returns URL param value when present', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?view=list',
            },
        });

        const { result } = renderHook(() => useUrlFilter('view', 'grid'));

        const [value] = result.current;
        expect(value).toBe('list');
    });

    it('navigate function sets the filter param and calls router.get', () => {
        const { result } = renderHook(() =>
            useUrlFilter('sort', 'created_at-desc'),
        );

        const [, navigate] = result.current;
        navigate('price-asc');

        expect(mockRouterGet).toHaveBeenCalledWith(
            expect.stringContaining('/products?sort=price-asc'),
        );
    });

    it('navigate function deletes param when value equals default', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?sort=price-asc',
            },
        });

        const { result } = renderHook(() =>
            useUrlFilter('sort', 'created_at-desc'),
        );

        const [, navigate] = result.current;
        navigate('created_at-desc');

        expect(mockRouterGet).toHaveBeenCalledWith(
            expect.not.stringContaining('sort'),
        );
    });

    it('navigate function deletes page param', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?sort=created_at-desc&page=2',
            },
        });

        const { result } = renderHook(() =>
            useUrlFilter('sort', 'created_at-desc'),
        );

        const [, navigate] = result.current;
        navigate('price-asc');

        const url = mockRouterGet.mock.calls[0][0];
        expect(url).toContain('sort=price-asc');
        expect(url).not.toContain('page=');
    });
});
