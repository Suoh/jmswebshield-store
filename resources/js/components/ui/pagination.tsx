import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links?: PaginationLink[];
    className?: string;
    onPageChange?: (page: number) => void;
    currentPage?: number;
    lastPage?: number;
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

function buildPageRange(current: number, last: number): number[] {
    const pages: number[] = [];
    const start = Math.max(1, current - 1);
    const end = Math.min(last, current + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return pages;
}

export function Pagination({
    links,
    className,
    onPageChange,
    currentPage,
    lastPage,
}: PaginationProps) {
    if (onPageChange && currentPage !== undefined && lastPage !== undefined) {
        const pages = buildPageRange(currentPage, lastPage);

        return (
            <div
                className={cn(
                    'mt-4 flex items-center justify-center gap-2',
                    className,
                )}
            >
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    Anterior
                </Button>

                {pages.map((page) => (
                    <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </Button>
                ))}

                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= lastPage}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Siguiente
                </Button>
            </div>
        );
    }

    if (!links) {
        return null;
    }

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
