import { router } from '@inertiajs/react';
import CategoryForm from '@/components/admin/category-form';

export default function AdminCategoriesCreate() {
    const handleSubmit = (data: { name: string }) => {
        router.post('/admin/categories', data);
    };

    return (
        <div className="p-6">
            <CategoryForm onSubmit={handleSubmit} />
        </div>
    );
}
