import { Badge } from '@/components/ui/badge';

type PriceSize = 'sm' | 'md' | 'lg';

interface ProductPriceProps {
    price: string | number;
    discountedPrice?: string | number | null;
    discount?: number | null;
    size?: PriceSize;
}

export default function ProductPrice({
    price,
    discountedPrice,
    discount,
    size = 'md',
}: ProductPriceProps) {
    const textSizeClasses: Record<PriceSize, string> = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    const discountedSizeClasses: Record<PriceSize, string> = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    if (discountedPrice) {
        return (
            <div className="flex items-center gap-1.5">
                <span
                    className={`${textSizeClasses[size]} text-muted-foreground line-through`}
                >
                    ${price}
                </span>
                <span
                    className={`${discountedSizeClasses[size]} font-bold text-primary`}
                >
                    ${discountedPrice}
                </span>
                {discount && discount > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                        -{discount}%
                    </Badge>
                )}
            </div>
        );
    }

    return (
        <span className={`${textSizeClasses[size]} font-bold`}>${price}</span>
    );
}
