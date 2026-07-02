import jmsUrl from '@/images/jms.png';
import { cn } from '@/lib/utils';

const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14',
} as const;

const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
} as const;

type BrandLogoSizes = keyof typeof sizeClasses;

interface BrandLogoProps {
    size?: BrandLogoSizes;
    withText?: boolean;
    text?: string;
    className?: string;
    textClassName?: string;
}

export default function BrandLogo({
    size = 'md',
    withText = true,
    text = 'JMS WebShield Store',
    className,
    textClassName,
}: BrandLogoProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <img
                src={jmsUrl}
                alt="JMS WebShield Store"
                className={cn(sizeClasses[size], 'w-auto')}
            />
            {withText && (
                <span
                    className={cn(
                        'font-semibold',
                        textSizeClasses[size],
                        textClassName,
                    )}
                >
                    {text}
                </span>
            )}
        </div>
    );
}
