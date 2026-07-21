import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductPrice from '@/components/product/product-price';

describe('ProductPrice', () => {
    it('renders original price when no discount', () => {
        render(<ProductPrice price={1500.0} size="md" />);

        expect(screen.getByText('$1500')).toBeInTheDocument();
    });

    it('renders original price line-through when discounted price present', () => {
        render(
            <ProductPrice
                price={1500.0}
                discountedPrice={1200.0}
                discount={20}
                size="md"
            />,
        );

        const original = screen.getByText('$1500');
        expect(original).toHaveClass('line-through');

        const discounted = screen.getByText('$1200');
        expect(discounted).toHaveClass('text-primary');
    });

    it('renders discount badge when discount > 0', () => {
        render(
            <ProductPrice
                price={1500.0}
                discountedPrice={1200.0}
                discount={20}
                size="md"
            />,
        );

        expect(screen.getByText('-20%')).toBeInTheDocument();
    });

    it('does not render discount badge when discount is 0', () => {
        render(
            <ProductPrice
                price={1500.0}
                discountedPrice={1500.0}
                discount={0}
                size="md"
            />,
        );

        expect(screen.queryByText('-0%')).not.toBeInTheDocument();
    });

    it('applies size-specific text classes', () => {
        const { container: smContainer } = render(
            <ProductPrice price={100} size="sm" />,
        );
        expect(smContainer.querySelector('span')).toHaveClass('text-xs');

        const { container: lgContainer } = render(
            <ProductPrice price={100} size="lg" />,
        );
        expect(lgContainer.querySelector('span')).toHaveClass('text-base');
    });
});
