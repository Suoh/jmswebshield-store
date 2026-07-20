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

const PAGE_WINDOW = 10;

const LABEL_TRANSLATIONS: Record<string, string> = {
    '&laquo; Previous': '&laquo; Anterior',
    '« Previous': '« Anterior',
    Previous: 'Anterior',
    'Next &raquo;': 'Siguiente &raquo;',
    'Next »': 'Siguiente »',
    Next: 'Siguiente',
};

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

function translateLabel(label: string): string {
    return LABEL_TRANSLATIONS[label] ?? label;
}

function getPaginationPages(current: number, last: number): (number | 'ellipsis')[] {
    if (last <= PAGE_WINDOW + 2) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const half = Math.floor(PAGE_WINDOW / 2);

    let start = Math.max(1, current - half);
    let end = start + PAGE_WINDOW - 1;

    if (end > last) {
        end = last;
        start = Math.max(1, end - PAGE_WINDOW + 1);
    }

    if (start > 1) {
        pages.push(1);
        if (start > 2) {
            pages.push('ellipsis');
        }
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    if (end < last) {
        if (end < last - 1) {
            pages.push('ellipsis');
        }
        pages.push(last);
    }

    return pages;
}

type PageItem = number | 'ellipsis';

function renderPageButton(
    page: PageItem,
    index: number,
    currentPage: number,
    onClick: (page: number) => void,
) {
    if (page === 'ellipsis') {
        return (
            <Button
                key={`ellipsis-${index}`}
                variant="outline"
                size="sm"
                disabled
                className="cursor-default"
            >
                ...
            </Button>
        );
    }

    return (
        <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            onClick={() => onClick(page)}
        >
            {page}
        </Button>
    );
}

export function Pagination({
    links,
    className,
    onPageChange,
    currentPage,
    lastPage,
}: PaginationProps) {
    if (onPageChange && currentPage !== undefined && lastPage !== undefined) {
        const pages = getPaginationPages(currentPage, lastPage);

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

                {pages.map((page, index) =>
                    renderPageButton(page, index, currentPage, onPageChange),
                )}

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

    if (currentPage !== undefined && lastPage !== undefined) {
        const pages = getPaginationPages(currentPage, lastPage);
        const prevLink = links.find((l) => {
            const t = translateLabel(l.label);
            return t === '&laquo; Anterior' || t === '« Anterior' || t === 'Anterior';
        });
        const nextLink = links.find((l) => {
            const t = translateLabel(l.label);
            return t === 'Siguiente &raquo;' || t === 'Siguiente »' || t === 'Siguiente';
        });

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
                    disabled={!prevLink?.url}
                    onClick={() => prevLink?.url && router.get(prevLink.url)}
                >
                    {prevLink
                        ? decodeLabel(translateLabel(prevLink.label))
                        : 'Anterior'}
                </Button>

                {pages.map((page, index) =>
                    renderPageButton(page, index, currentPage, (p) => {
                        const link = links.find(
                            (l) => l.label === String(p) && l.url,
                        );
                        if (link?.url) {
                            router.get(link.url);
                        }
                    }),
                )}

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!nextLink?.url}
                    onClick={() => nextLink?.url && router.get(nextLink.url)}
                >
                    {nextLink
                        ? decodeLabel(translateLabel(nextLink.label))
                        : 'Siguiente'}
                </Button>
            </div>
        );
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
                    {decodeLabel(translateLabel(link.label))}
                </Button>
            ))}
        </div>
    );
}
