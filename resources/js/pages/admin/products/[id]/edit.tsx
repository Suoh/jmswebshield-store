import { router, usePage } from '@inertiajs/react';
import ProductForm from '@/components/admin/product-form';
import type { Brand, Product } from '@/types/models';

interface PageProps {
    product: Product;
    brands: Brand[];
    [key: string]: unknown;
}

export default function AdminProductsEdit() {
    const { product, brands } = usePage<PageProps>().props;

    const handleSubmit = (data: Record<string, unknown>) => {
        router.put(`/admin/products/${product.id}`, data);
    };

    return (
        <div className="p-6">
            <ProductForm
                brands={brands}
                product={product}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
