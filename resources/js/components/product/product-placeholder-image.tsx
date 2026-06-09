interface ProductPlaceholderImageProps {
    className?: string;
}

export default function ProductPlaceholderImage({
    className,
}: ProductPlaceholderImageProps) {
    return (
        <div
            className={`flex aspect-[4/3] w-full items-center justify-center bg-muted ${className ?? ''}`}
            role="img"
            aria-label="Sin imagen disponible"
        >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="text-xs font-medium">Sin imagen</span>
            </div>
        </div>
    );
}
