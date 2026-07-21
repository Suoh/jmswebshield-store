import { Badge } from '@/components/ui/badge';

interface ProductAvailabilityBadgeProps {
    availability: string;
    className?: string;
}

export default function ProductAvailabilityBadge({
    availability,
    className,
}: ProductAvailabilityBadgeProps) {
    const isAvailable = availability === 'Disponible';

    return (
        <Badge
            variant={isAvailable ? 'default' : 'destructive'}
            className={className}
        >
            {isAvailable ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-2.5"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-2.5 fill-current"
                >
                    <circle cx="12" cy="12" r="10" />
                </svg>
            )}
            {availability}
        </Badge>
    );
}
