import * as React from 'react';
import type { AppVariant } from '@/types';

type Props = React.ComponentProps<'div'> & {
    variant?: AppVariant;
};

export function AppContent({ variant = 'sidebar', children, ...props }: Props) {
    if (variant === 'sidebar') {
        return (
            <div className="relative flex w-full flex-1 flex-col" {...props}>
                {children}
            </div>
        );
    }

    return (
        <main
            className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl"
            {...props}
        >
            {children}
        </main>
    );
}
