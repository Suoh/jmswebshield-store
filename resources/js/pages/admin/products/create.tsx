import { router, usePage } from '@inertiajs/react';
import ProductForm from '@/components/admin/product-form';
import type { ProductFormPayload } from '@/components/admin/product-form';
import type { Brand, Category } from '@/types/models';

interface PageProps {
    brands: Brand[];
    categories: Category[];
    [key: string]: unknown;
}

export default function AdminProductsCreate() {
    const { brands, categories } = usePage<PageProps>().props;

    const handleSubmit = (data: ProductFormPayload) => {
        router.post('/admin/products', data as unknown as FormData);
    };

    return (
        <div className="p-6">
            <ProductForm
                brands={brands}
                categories={categories}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
