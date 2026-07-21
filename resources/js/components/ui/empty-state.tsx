import { cn } from '@/lib/utils';

interface EmptyStateProps {
    title: string;
    description?: string;
    className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex min-h-[120px] flex-col items-center justify-center gap-1 py-6 text-center',
                className,
            )}
        >
            <p className="text-sm font-medium">{title}</p>
            {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
            )}
        </div>
    );
}
