import { router } from '@inertiajs/react';
import BrandForm from '@/components/admin/brand-form';

export default function AdminBrandsCreate() {
    const handleSubmit = (data: { name: string }) => {
        router.post('/admin/brands', data);
    };

    return (
        <div className="p-6">
            <BrandForm onSubmit={handleSubmit} />
        </div>
    );
}
