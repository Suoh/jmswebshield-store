import { router, usePage } from '@inertiajs/react';
import ProductForm from '@/components/admin/product-form';
import type { Brand } from '@/types/models';

interface PageProps {
    brands: Brand[];
    [key: string]: unknown;
}

export default function AdminProductsCreate() {
    const { brands } = usePage<PageProps>().props;

    const handleSubmit = (data: Record<string, unknown>) => {
        router.post('/admin/products', data);
    };

    return (
        <div className="p-6">
            <ProductForm brands={brands} onSubmit={handleSubmit} />
        </div>
    );
}
