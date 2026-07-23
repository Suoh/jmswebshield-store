import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { router } from '@inertiajs/react';
import { GripVertical, X } from 'lucide-react';
import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Table, TableCell, TableRow } from '@/components/ui/table';
import type { FeaturedItem } from '@/types';

interface DeleteDialogContextValue {
    setDeleteTarget: (id: number | null) => void;
    confirmDelete: () => void;
    deleteDialogTitle: string;
    getDeleteDialogDescription: (name: string) => string;
    getName: (item: FeaturedItem) => string;
}

const DeleteDialogContext = createContext<DeleteDialogContextValue | null>(
    null,
);

function useDeleteDialog() {
    const ctx = useContext(DeleteDialogContext);

    if (!ctx) {
        throw new Error(
            'FeaturedItemRow must be used inside FeaturedItemTable',
        );
    }

    return ctx;
}

interface FeaturedItemTableProps {
    items: FeaturedItem[];
    droppableId: string;
    reorderUrl: string;
    deleteUrl: string;
    deleteDialogTitle: string;
    getDeleteDialogDescription: (name: string) => string;
    getName: (item: FeaturedItem) => string;
    deleteErrorMessage: string;
    emptyIcon: React.ElementType;
    emptyTitle: string;
    emptyDescription: string;
    children: ReactNode;
}

export default function FeaturedItemTable({
    items,
    droppableId,
    reorderUrl,
    deleteUrl,
    deleteDialogTitle,
    getDeleteDialogDescription,
    getName,
    deleteErrorMessage,
    emptyIcon: EmptyIcon,
    emptyTitle,
    emptyDescription,
    children,
}: FeaturedItemTableProps) {
    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const handleDragEnd = useCallback(
        (result: DropResult) => {
            if (!result.destination) {
                return;
            }

            const reordered = Array.from(items);
            const [removed] = reordered.splice(result.source.index, 1);
            reordered.splice(result.destination.index, 0, removed);

            router.put(
                reorderUrl,
                { ids: reordered.map((item) => item.id) },
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Orden actualizado.'),
                    onError: () => toast.error('Error al reordenar.'),
                },
            );
        },
        [items, reorderUrl],
    );

    const confirmDelete = useCallback(() => {
        if (deleteTarget) {
            router.delete(`${deleteUrl}/${deleteTarget}`, {
                preserveScroll: true,
                onError: () => toast.error(deleteErrorMessage),
            });
            setDeleteTarget(null);
        }
    }, [deleteTarget, deleteUrl, deleteErrorMessage]);

    const contextValue = useMemo(
        () => ({
            setDeleteTarget,
            confirmDelete,
            deleteDialogTitle,
            getDeleteDialogDescription,
            getName,
        }),
        [confirmDelete, deleteDialogTitle, getDeleteDialogDescription, getName],
    );

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <EmptyIcon className="size-12" />
                <p className="text-lg font-medium">{emptyTitle}</p>
                <p className="text-sm">{emptyDescription}</p>
            </div>
        );
    }

    return (
        <DeleteDialogContext.Provider value={contextValue}>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={droppableId}>
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <Table>{children}</Table>
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </DeleteDialogContext.Provider>
    );
}

interface FeaturedItemRowProps {
    item: FeaturedItem;
    index: number;
    children: ReactNode;
}

export function FeaturedItemRow({
    item,
    index,
    children,
}: FeaturedItemRowProps) {
    const {
        setDeleteTarget,
        confirmDelete,
        deleteDialogTitle,
        getDeleteDialogDescription,
        getName,
    } = useDeleteDialog();

    const itemName = getName(item);
    const dialogDescription = getDeleteDialogDescription(itemName);

    return (
        <Draggable key={item.id} draggableId={String(item.id)} index={index}>
            {(provided) => (
                <TableRow ref={provided.innerRef} {...provided.draggableProps}>
                    <TableCell>
                        <div
                            {...provided.dragHandleProps}
                            className="cursor-grab text-muted-foreground hover:text-foreground"
                        >
                            <GripVertical className="size-4" />
                        </div>
                    </TableCell>
                    {children}
                    <TableCell className="text-right">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setDeleteTarget(item.id)}
                                >
                                    <X className="mr-1 size-4" />
                                    Quitar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {deleteDialogTitle}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {dialogDescription}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive text-destructive-foreground hover:bg-[color-mix(in_oklch,var(--destructive),var(--foreground)_10%)]"
                                        onClick={confirmDelete}
                                    >
                                        Quitar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                </TableRow>
            )}
        </Draggable>
    );
}
