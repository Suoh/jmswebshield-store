import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BrandLogo from '@/components/brand-logo';

describe('BrandLogo', () => {
    it('renders an img with alt text "JMS WebShield Store"', () => {
        render(<BrandLogo withText={false} />);

        const img = screen.getByRole('img', { name: 'JMS WebShield Store' });
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src');
    });

    it('applies the correct height class based on size prop', () => {
        const { rerender } = render(<BrandLogo size="sm" withText={false} />);
        let img = screen.getByRole('img');
        expect(img.className).toContain('h-6');

        rerender(<BrandLogo size="md" withText={false} />);
        img = screen.getByRole('img');
        expect(img.className).toContain('h-8');

        rerender(<BrandLogo size="lg" withText={false} />);
        img = screen.getByRole('img');
        expect(img.className).toContain('h-10');

        rerender(<BrandLogo size="xl" withText={false} />);
        img = screen.getByRole('img');
        expect(img.className).toContain('h-14');
    });

    it('shows text by default with "JMS WebShield Store"', () => {
        render(<BrandLogo />);

        expect(screen.getByText('JMS WebShield Store')).toBeInTheDocument();
    });

    it('hides text when withText is false', () => {
        render(<BrandLogo withText={false} />);

        expect(
            screen.queryByText('JMS WebShield Store'),
        ).not.toBeInTheDocument();
    });

    it('renders custom text when text prop is provided', () => {
        render(<BrandLogo text="Mi Tienda" />);

        expect(screen.getByText('Mi Tienda')).toBeInTheDocument();
    });

    it('applies extra className to the wrapper', () => {
        const { container } = render(
            <BrandLogo className="my-custom-logo" withText={false} />,
        );

        expect(container.firstChild).toHaveClass('my-custom-logo');
    });

    it('applies extra textClassName to the text span', () => {
        render(<BrandLogo textClassName="text-blue-500" />);

        const span = screen.getByText('JMS WebShield Store');
        expect(span.className).toContain('text-blue-500');
    });

    it('w-auto class is always present on the image', () => {
        render(<BrandLogo size="lg" withText={false} />);

        const img = screen.getByRole('img');
        expect(img.className).toContain('w-auto');
    });
});
