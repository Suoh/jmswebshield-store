import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface FeaturedItemModalProps<T extends { id: number }> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: ReactNode;
    title: string;
    description: string;
    searchPlaceholder: string;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    items: T[];
    emptySearchMessage: string;
    emptyAvailableMessage: string;
    onItemSelect: (id: number) => void;
    renderItem: (item: T) => ReactNode;
}

export default function FeaturedItemModal<T extends { id: number }>({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    searchPlaceholder,
    searchTerm,
    onSearchChange,
    items,
    emptySearchMessage,
    emptyAvailableMessage,
    onItemSelect,
    renderItem,
}: FeaturedItemModalProps<T>) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="flex max-w-2xl flex-col">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                    <div className="relative shrink-0">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {items.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                {searchTerm
                                    ? emptySearchMessage
                                    : emptyAvailableMessage}
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {items.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition hover:bg-muted"
                                        onClick={() => onItemSelect(item.id)}
                                    >
                                        {renderItem(item)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
