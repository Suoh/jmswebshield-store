import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonTable } from '@/components/ui/skeleton-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DataTableProps {
    columns: Array<string | React.ReactNode>;
    colSpan: number;
    children?: React.ReactNode;
    loading?: boolean;
    loadingRows?: number;
    emptyTitle?: string;
    emptyDescription?: string;
    footer?: React.ReactNode;
    scrollHorizontal?: boolean;
    className?: string;
}

export function DataTable({
    columns,
    colSpan,
    children,
    loading = false,
    loadingRows = 10,
    emptyTitle,
    emptyDescription,
    footer,
    scrollHorizontal = false,
    className,
}: DataTableProps) {
    const hasData = !loading && children != null;

    return (
        <div className={className}>
            <div
                className={cn(
                    'overflow-hidden rounded-lg border bg-card',
                    scrollHorizontal && 'overflow-x-auto',
                )}
            >
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead key={index}>{column}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {loading ? (
                        <SkeletonTable
                            columns={colSpan}
                            rows={loadingRows}
                        />
                    ) : hasData ? (
                        <TableBody>{children}</TableBody>
                    ) : emptyTitle ? (
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={colSpan}>
                                    <EmptyState
                                        title={emptyTitle}
                                        description={emptyDescription}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    ) : null}
                </Table>
            </div>

            {footer && <div className="mt-4">{footer}</div>}
        </div>
    );
}
