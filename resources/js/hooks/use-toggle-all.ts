import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseToggleAllOptions<T> {
    items: T[];
    getId: (item: T) => string;
}

interface UseToggleAllReturn {
    selected: Set<string>;
    toggleAll: () => void;
    toggleOne: (id: string) => void;
    isSelected: (id: string) => boolean;
    isAllSelected: boolean;
    reset: () => void;
}

export function useToggleAll<T>({
    items,
    getId,
}: UseToggleAllOptions<T>): UseToggleAllReturn {
    const allIds = useMemo(() => items.map(getId), [items, getId]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const prevIdsKeyRef = useRef('');
    const idsKey = allIds.join(',');

    useEffect(() => {
        if (prevIdsKeyRef.current && prevIdsKeyRef.current !== idsKey) {
            setSelected(new Set());
        }

        prevIdsKeyRef.current = idsKey;
    }, [idsKey]);

    const toggleAll = useCallback(() => {
        setSelected((prev) =>
            prev.size === allIds.length ? new Set() : new Set(allIds),
        );
    }, [allIds]);

    const toggleOne = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }, []);

    const reset = useCallback(() => {
        setSelected(new Set());
    }, []);

    const isSelected = useCallback(
        (id: string) => selected.has(id),
        [selected],
    );

    const isAllSelected = allIds.length > 0 && selected.size === allIds.length;

    return { selected, toggleAll, toggleOne, isSelected, isAllSelected, reset };
}
