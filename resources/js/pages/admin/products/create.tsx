import { router, usePage } from '@inertiajs/react';
import ProductForm from '@/components/admin/product-form';
import type { Brand } from '@/types/models';

interface PageProps {
    brands: Brand[];
    [key: string]: unknown;
}

export default function AdminProductsCreate() {
    const { brands } = usePage<PageProps>().props;

    const handleSubmit = (data: unknown) => {
        // @ts-expect-error Inertia router accepts various data types
        router.post('/admin/products', data);
    };

    return (
        <div className="p-6">
            <ProductForm brands={brands} onSubmit={handleSubmit} />
        </div>
    );
}
