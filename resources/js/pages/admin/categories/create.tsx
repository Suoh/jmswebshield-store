import { router } from '@inertiajs/react';
import CategoryForm from '@/components/admin/category-form';

export default function AdminCategoriesCreate() {
    const handleSubmit = (data: { name: string; image?: File | null }) => {
        router.post('/admin/categories', data as never);
    };

    return (
        <div className="p-6">
            <CategoryForm onSubmit={handleSubmit} />
        </div>
    );
}
