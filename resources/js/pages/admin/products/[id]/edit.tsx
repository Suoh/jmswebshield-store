import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import ProductForm from '@/components/admin/product-form';
import ProductImageUploader from '@/components/admin/product-image-uploader';
import type { Brand, Product } from '@/types/models';

interface PageProps {
    product: Product;
    brands: Brand[];
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

export default function AdminProductsEdit() {
    const { product, brands, flash } = usePage<PageProps>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSubmit = (data: unknown) => {
        // @ts-expect-error Inertia router accepts various data types
        router.put(`/admin/products/${product.id}`, data);
    };

    return (
        <div className="space-y-8 p-6">
            <ProductForm
                brands={brands}
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
