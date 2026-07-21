import type { Product } from '@/types/models';

interface BrandNameProps {
    brand: Product['brand'] | null;
}

export default function BrandName({ brand }: BrandNameProps) {
    const name =
        brand?.name === 'sinmarca' ? 'Sin marca' : (brand?.name ?? 'Sin marca');

    return <span className="text-xs text-muted-foreground">{name}</span>;
}
