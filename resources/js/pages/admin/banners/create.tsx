import { router } from '@inertiajs/react';
import BannerForm from '@/components/admin/banner-form';
import type { BannerFormData } from '@/components/admin/banner-form';

export default function AdminBannersCreate() {
    const handleSubmit = (data: BannerFormData) => {
        router.post('/admin/banners', data as never);
    };

    return (
        <div className="p-6">
            <BannerForm onSubmit={handleSubmit} />
        </div>
    );
}
