import { Skeleton } from '@/components/ui/skeleton';
import {
    TableBody,
    TableCell,
    TableRow,
} from '@/components/ui/table';

interface SkeletonTableProps {
    columns: number;
    rows?: number;
    cellClassName?: string;
    className?: string;
}

export function SkeletonTable({
    columns,
    rows = 10,
    cellClassName = 'h-4',
    className,
}: SkeletonTableProps) {
    const rowIndexes = Array.from({ length: rows }, (_, i) => i);

    return (
        <TableBody className={className}>
            {rowIndexes.map((rowIndex) => (
                <TableRow key={rowIndex}>
                    {Array.from({ length: columns }, (_, colIndex) => (
                        <TableCell key={colIndex}>
                            <Skeleton className={cellClassName} />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    );
}
