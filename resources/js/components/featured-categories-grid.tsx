import { Link } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, FeaturedItem } from '@/types';

interface FeaturedCategoriesGridProps {
    items: FeaturedItem[];
}

export default function FeaturedCategoriesGrid({
    items,
}: FeaturedCategoriesGridProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section>
            <h2 className="mb-4 text-xl font-bold">Categorías destacadas</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item) => {
                    const category = item.featurable as Category;

                    return (
                        <Link
                            key={item.id}
                            href={`/products?category[]=${category.id}`}
                            preserveScroll
                            className="group block overflow-hidden rounded-xl border bg-card transition hover:border-primary/40 hover:shadow-md"
                        >
                            <div
                                className={cn(
                                    'overflow-hidden bg-muted',
                                    category.image_url
                                        ? 'aspect-[16/9]'
                                        : 'flex aspect-[16/9] items-center justify-center',
                                )}
                            >
                                {category.image_url ? (
                                    <img
                                        src={category.image_url}
                                        alt={category.name}
                                        className="size-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <ImageIcon className="size-8 text-muted-foreground/50" />
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold">
                                    {category.name}
                                </h3>
                                {category.products_count !== undefined && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {category.products_count} producto
                                        {category.products_count !== 1
                                            ? 's'
                                            : ''}
                                    </p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
