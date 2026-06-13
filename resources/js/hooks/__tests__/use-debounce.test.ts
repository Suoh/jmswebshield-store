import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('hello', 300));

        expect(result.current).toBe('hello');
    });

    it('updates value after the specified delay', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'hello', delay: 300 } },
        );

        rerender({ value: 'world', delay: 300 });
        expect(result.current).toBe('hello');

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe('world');
    });

    it('cancels previous timeout on rapid changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'a', delay: 300 } },
        );

        rerender({ value: 'ab', delay: 300 });
        act(() => {
            vi.advanceTimersByTime(150);
        });

        rerender({ value: 'abc', delay: 300 });
        act(() => {
            vi.advanceTimersByTime(150);
        });

        expect(result.current).toBe('a');

        act(() => {
            vi.advanceTimersByTime(150);
        });

        expect(result.current).toBe('abc');
    });

    it('returns the latest value after multiple updates', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: '', delay: 300 } },
        );

        rerender({ value: 'x', delay: 300 });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe('x');

        rerender({ value: 'y', delay: 300 });

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe('y');
    });
});
