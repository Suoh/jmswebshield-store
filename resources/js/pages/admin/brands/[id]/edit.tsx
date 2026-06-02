import { router, usePage } from '@inertiajs/react';
import BrandForm from '@/components/admin/brand-form';

interface Brand {
    id: number;
    name: string;
    slug: string;
    products_count: number;
}

interface PageProps {
    brand: Brand;
    [key: string]: unknown;
}

export default function AdminBrandsEdit() {
    const { brand } = usePage<PageProps>().props;

    const handleSubmit = (data: { name: string }) => {
        router.put(`/admin/brands/${brand.id}`, data);
    };

    return (
        <div className="p-6">
            <BrandForm brand={brand} onSubmit={handleSubmit} />
        </div>
    );
}
