import { router, usePage } from '@inertiajs/react';
import CategoryForm from '@/components/admin/category-form';

interface Category {
    id: number;
    name: string;
    slug: string;
    products_count: number;
}

interface PageProps {
    category: Category;
    [key: string]: unknown;
}

export default function AdminCategoriesEdit() {
    const { category } = usePage<PageProps>().props;

    const handleSubmit = (data: { name: string }) => {
        router.put(`/admin/categories/${category.id}`, data);
    };

    return (
        <div className="p-6">
            <CategoryForm category={category} onSubmit={handleSubmit} />
        </div>
    );
}
