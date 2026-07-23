import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';

export default function AppearanceToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';
    const nextAppearance = isDark ? 'light' : 'dark';
    const label = isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';
    const Icon = isDark ? Sun : Moon;

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            title={label}
            onClick={() => updateAppearance(nextAppearance)}
        >
            <Icon aria-hidden="true" />
        </Button>
    );
}
