import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProductAvailabilityBadge from '@/components/product/product-availability-badge';

describe('ProductAvailabilityBadge', () => {
    it('renders "Disponible" text', () => {
        render(<ProductAvailabilityBadge availability="Disponible" />);

        expect(screen.getByText('Disponible')).toBeInTheDocument();
    });

    it('renders "Agotado" text', () => {
        render(<ProductAvailabilityBadge availability="Agotado" />);

        expect(screen.getByText('Agotado')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
        render(
            <ProductAvailabilityBadge
                availability="Disponible"
                className="absolute top-2 right-2"
            />,
        );

        const badge = screen
            .getByText('Disponible')
            .closest('[class*="absolute"]');
        expect(badge).toHaveClass('absolute');
    });
});
