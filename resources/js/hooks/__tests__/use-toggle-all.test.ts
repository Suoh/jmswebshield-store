import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToggleAll } from '@/hooks/use-toggle-all';

interface TestItem {
    id: string;
    name: string;
}

const items: TestItem[] = [
    { id: '1', name: 'A' },
    { id: '2', name: 'B' },
    { id: '3', name: 'C' },
];

describe('useToggleAll', () => {
    it('starts with empty selection', () => {
        const { result } = renderHook(() =>
            useToggleAll({ items, getId: (item) => item.id }),
        );

        expect(result.current.selected.size).toBe(0);
        expect(result.current.isAllSelected).toBe(false);
    });

    it('toggleAll selects all items when none are selected', () => {
        const { result } = renderHook(() =>
            useToggleAll({ items, getId: (item) => item.id }),
        );

        act(() => result.current.toggleAll());

        expect(result.current.selected.size).toBe(3);
        expect(result.current.isAllSelected).toBe(true);
    });

    it('toggleAll deselects all items when all are selected', () => {
        const { result } = renderHook(() =>
            useToggleAll({ items, getId: (item) => item.id }),
        );

        act(() => result.current.toggleAll());
        expect(result.current.isAllSelected).toBe(true);

        act(() => result.current.toggleAll());
        expect(result.current.selected.size).toBe(0);
        expect(result.current.isAllSelected).toBe(false);
    });

    it('toggleOne adds an item', () => {
        const { result } = renderHook(() =>
            useToggleAll({ items, getId: (item) => item.id }),
        );

        act(() => result.current.toggleOne('2'));

        expect(result.current.selected.has('2')).toBe(true);
        expect(result.current.selected.size).toBe(1);
        expect(result.current.isAllSelected).toBe(false);
    });

    it('toggleOne removes an item', () => {
        const { result } = renderHook(() =>
            useToggleAll({ items, getId: (item) => item.id }),
        );

        act(() => result.current.toggleAll());
        act(() => result.current.toggleOne('2'));

        expect(result.current.selected.has('2')).toBe(false);
        expect(result.current.selected.size).toBe(2);
        expect(result.current.isAllSelected).toBe(false);
    });

    it('isSelected returns correct boolean', () => {
        const { result } = renderHook(() =>
            useToggleAll({ items, getId: (item) => item.id }),
        );

        act(() => result.current.toggleOne('1'));

        expect(result.current.isSelected('1')).toBe(true);
        expect(result.current.isSelected('2')).toBe(false);
    });

    it('resets when items change', () => {
        const { result, rerender } = renderHook(
            ({ items }) =>
                useToggleAll({ items, getId: (item: TestItem) => item.id }),
            { initialProps: { items } },
        );

        act(() => result.current.toggleAll());
        expect(result.current.selected.size).toBe(3);

        rerender({ items: [{ id: '4', name: 'D' }] });

        expect(result.current.selected.size).toBe(0);
    });

    it('works with custom getId', () => {
        const { result } = renderHook(() =>
            useToggleAll({ items, getId: (item) => item.name }),
        );

        act(() => result.current.toggleOne('A'));

        expect(result.current.selected.has('A')).toBe(true);
    });
});
