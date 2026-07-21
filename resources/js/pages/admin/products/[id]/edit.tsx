import { router, usePage } from '@inertiajs/react';
import ProductForm from '@/components/admin/product-form';
import type { ProductFormPayload } from '@/components/admin/product-form';
import { useFlashToast } from '@/hooks/use-flash-toast';
import type { Brand, Category, Product } from '@/types/models';

interface PageProps {
    product: Product;
    brands: Brand[];
    categories: Category[];
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export default function AdminProductsEdit() {
    const { product, brands, categories, flash } = usePage<PageProps>().props;

    useFlashToast(flash);

    const handleSubmit = (data: ProductFormPayload) => {
        router.put(
            `/admin/products/${product.id}`,
            data as unknown as FormData,
        );
    };

    return (
        <div className="p-6">
            <ProductForm
                brands={brands}
                categories={categories}
                product={product}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
