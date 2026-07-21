import { LayoutGrid, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useUrlFilter } from '@/hooks/use-url-filter';

export default function ViewToggle() {
    const [view, setView] = useUrlFilter('view', 'grid');

    const handleValueChange = (value: string) => {
        if (!value) {
            return;
        }

        setView(value);
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
