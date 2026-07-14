import { router, usePage } from '@inertiajs/react';
import BannerForm from '@/components/admin/banner-form';
import type { BannerFormData } from '@/components/admin/banner-form';
import type { Banner } from '@/types';

interface PageProps {
    banner: Banner;
    [key: string]: unknown;
}

export default function AdminBannersEdit() {
    const { banner } = usePage<PageProps>().props;

    const handleSubmit = (data: BannerFormData) => {
        router.put(`/admin/banners/${banner.id}`, data as never);
    };

    return (
        <div className="p-6">
            <BannerForm banner={banner} onSubmit={handleSubmit} />
        </div>
    );
}
