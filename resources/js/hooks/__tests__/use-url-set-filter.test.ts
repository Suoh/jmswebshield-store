import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRouterGet = vi.fn();

vi.mock('@inertiajs/react', () => ({
    router: {
        get: (...args: unknown[]) => mockRouterGet(...args),
    },
}));

import { useUrlSetFilter } from '@/hooks/use-url-set-filter';

describe('useUrlSetFilter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('window', {
            location: {
                search: '',
                pathname: '/products',
            },
        });
    });

    it('returns empty set when no URL params are present', () => {
        const { result } = renderHook(() => useUrlSetFilter('brand[]'));

        const [value] = result.current;
        expect(value.size).toBe(0);
    });

    it('reads values from brand[] URL params', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?brand%5B%5D=1&brand%5B%5D=3&brand%5B%5D=5',
                pathname: '/products',
            },
        });

        const { result } = renderHook(() => useUrlSetFilter('brand[]'));

        const [value] = result.current;
        expect(value.size).toBe(3);
        expect(value.has('1')).toBe(true);
        expect(value.has('3')).toBe(true);
        expect(value.has('5')).toBe(true);
    });

    it('reads values from brand[X] URL params (Laravel format)', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?brand%5B0%5D=1&brand%5B1%5D=3',
                pathname: '/products',
            },
        });

        const { result } = renderHook(() => useUrlSetFilter('brand[]'));

        const [value] = result.current;
        expect(value.has('1')).toBe(true);
        expect(value.has('3')).toBe(true);
    });

    it('navigate sets brand[] params for multiple values', () => {
        const { result } = renderHook(() => useUrlSetFilter('brand[]'));

        const [, navigate] = result.current;
        navigate(new Set(['2', '4']));

        const url = mockRouterGet.mock.calls[0][0];
        expect(url).toContain('brand%5B%5D=2');
        expect(url).toContain('brand%5B%5D=4');
    });

    it('navigate clears brand[] params for empty set', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?brand%5B%5D=1&search=test',
                pathname: '/products',
            },
        });

        const { result } = renderHook(() => useUrlSetFilter('brand[]'));

        const [, navigate] = result.current;
        navigate(new Set());

        const url = mockRouterGet.mock.calls[0][0];
        expect(url).not.toContain('brand');
        expect(url).toContain('search=test');
    });

    it('navigate deletes page param', () => {
        vi.stubGlobal('window', {
            location: {
                search: '?page=3&brand%5B%5D=1',
                pathname: '/products',
            },
        });

        const { result } = renderHook(() => useUrlSetFilter('brand[]'));

        const [, navigate] = result.current;
        navigate(new Set(['2']));

        const url = mockRouterGet.mock.calls[0][0];
        expect(url).not.toContain('page=');
    });

    it('uses custom basePath when provided', () => {
        const { result } = renderHook(() =>
            useUrlSetFilter('brand[]', '/custom/path'),
        );

        const [, navigate] = result.current;
        navigate(new Set(['1']));

        expect(mockRouterGet).toHaveBeenCalledWith(
            expect.stringContaining('/custom/path?brand%5B%5D=1'),
        );
    });
});
