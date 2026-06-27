import { Head } from '@inertiajs/react';
import FilterSidebar from '@/components/product/filter-sidebar';
import ProductCard from '@/components/product/product-card';
import ProductListRow from '@/components/product/product-list-row';
import SearchBar from '@/components/product/search-bar';
import SortSelect from '@/components/product/sort-select';
import ViewToggle from '@/components/product/view-toggle';
import { Pagination } from '@/components/ui/pagination';
import type { Brand, PaginatedData, Product } from '@/types/models';

interface Props {
    products: PaginatedData<Product>;
    brands: Brand[];
}

export default function ProductIndex({ products, brands }: Props) {
    const view =
        typeof window !== 'undefined'
            ? (new URLSearchParams(window.location.search).get('view') ??
              'grid')
            : 'grid';

    return (
        <>
            <Head title="Catálogo de productos" />
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    <aside className="w-full shrink-0 rounded-lg bg-sidebar p-4 lg:w-56">
                        <FilterSidebar brands={brands} />
                    </aside>

                    <div className="min-w-0 flex-1">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="max-w-md min-w-0 flex-1">
                                <SearchBar />
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                <SortSelect />
                                <ViewToggle />
                            </div>
                        </div>

                        {products.data.length === 0 ? (
                            <div className="flex min-h-[300px] items-center justify-center">
                                <div className="space-y-2 text-center">
                                    <p className="text-lg font-medium">
                                        No hay productos disponibles
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Probá cambiando los filtros o la
                                        búsqueda
                                    </p>
                                </div>
                            </div>
                        ) : view === 'list' ? (
                            <div className="space-y-3">
                                {products.data.map((product) => (
                                    <ProductListRow
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}

                        {products.last_page > 1 && (
                            <Pagination
                                links={products.links}
                                className="mt-8 flex-wrap"
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
