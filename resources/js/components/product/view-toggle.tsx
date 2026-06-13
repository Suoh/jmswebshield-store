import { router } from '@inertiajs/react';
import { LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export default function ViewToggle() {
    const [view, setView] = useState(() => {
        if (typeof window === 'undefined') {
            return 'grid';
        }

        return (
            new URLSearchParams(window.location.search).get('view') ?? 'grid'
        );
    });

    const handleValueChange = (value: string) => {
        if (!value) {
            return;
        }

        setView(value);
        const params = new URLSearchParams(window.location.search);
        params.set('view', value);
        const query = params.toString();
        router.get(`/products${query ? `?${query}` : ''}`);
    };

    return (
        <ToggleGroup
            type="single"
            value={view}
            onValueChange={handleValueChange}
            className="shrink-0"
        >
            <ToggleGroupItem value="grid" aria-label="Vista de mosaico">
                <LayoutGrid className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="Vista de lista">
                <List className="size-4" />
            </ToggleGroupItem>
        </ToggleGroup>
    );
}
