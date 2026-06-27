import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    className?: string;
}

const ENTITY_MAP: Record<string, string> = {
    '&laquo;': '«',
    '&raquo;': '»',
    '&nbsp;': ' ',
};

function decodeLabel(label: string): string {
    return label.replace(
        /&(laquo|raquo|nbsp);/g,
        (match) => ENTITY_MAP[match] ?? match,
    );
}

export function Pagination({ links, className }: PaginationProps) {
    return (
        <div
            className={cn(
                'mt-4 flex items-center justify-center gap-2',
                className,
            )}
        >
            {links.map((link, index) => (
                <Button
                    key={index}
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url)}
                >
                    {decodeLabel(link.label)}
                </Button>
            ))}
        </div>
    );
}
