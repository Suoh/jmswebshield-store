import { router, usePage } from '@inertiajs/react';
import ProductForm from '@/components/admin/product-form';
import type { ProductFormPayload } from '@/components/admin/product-form';
import ProductImageUploader from '@/components/admin/product-image-uploader';
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
        <div className="space-y-8 p-6">
            <ProductForm
                brands={brands}
                categories={categories}
                product={product}
                onSubmit={handleSubmit}
            />
            <div>
                <h2 className="mb-4 text-lg font-semibold">
                    Imágenes del producto
                </h2>
                <ProductImageUploader
                    productId={product.id}
                    images={product.images ?? []}
                />
            </div>
        </div>
    );
}
