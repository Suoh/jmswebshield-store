export interface Brand {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    name: string;
    short_description: string | null;
    full_description: string | null;
    stock: number;
    price: string;
    discount: number;
    image_url: string | null;
    brand_id: number | null;
    model: string | null;
    sku: string | null;
    metadata: Record<string, string> | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    brand?: Brand;
    availability: string;
    discounted_price: string | null;
    cover_image: string | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}
