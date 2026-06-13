import ProductPlaceholderImage from './product-placeholder-image';

interface ProductCoverImageProps {
    coverImage: string | null;
    alt: string;
    className?: string;
    aspect?: 'square' | 'video';
}

export default function ProductCoverImage({
    coverImage,
    alt,
    className,
    aspect = 'video',
}: ProductCoverImageProps) {
    const aspectClasses =
        aspect === 'square' ? 'aspect-square' : 'aspect-[4/3]';

    if (!coverImage) {
        return (
            <ProductPlaceholderImage
                className={`${aspectClasses} size-full ${className ?? ''}`}
            />
        );
    }

    return (
        <img
            src={coverImage}
            alt={alt}
            className={`${aspectClasses} size-full object-cover transition-transform duration-300 group-hover:scale-105 ${className ?? ''}`}
        />
    );
}
