import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    variant: 'active' | 'inactive';
    activeLabel?: string;
    inactiveLabel?: string;
    className?: string;
}

export default function StatusBadge({
    variant,
    activeLabel = 'Activo',
    inactiveLabel = 'Inactivo',
    className,
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                variant === 'active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                className,
            )}
        >
            {variant === 'active' ? activeLabel : inactiveLabel}
        </span>
    );
}
