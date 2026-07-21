import * as React from 'react';
import { cn } from '@/lib/utils';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'div'> & {
    variant?: AppVariant;
};

export function AppContent({ variant = 'sidebar', children, ...props }: Props) {
    if (variant === 'sidebar') {
        return (
            <div
                className={cn(
                    'relative flex w-full flex-1 flex-col overflow-y-auto overflow-x-hidden',
                    props.className,
                )}
                {...props}
            >
                {children}
            </div>
        );
    }

    return (
        <main
            className={cn(
                'mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl',
                props.className,
            )}
            {...props}
        >
            {children}
        </main>
    );
}
