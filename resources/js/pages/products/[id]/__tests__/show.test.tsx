import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
    usePage: () => ({
        props: {
            whatsappNumber: '5491123456789',
        },
    }),
}));

import ProductShow from '../show';

const mockProduct = {
    id: 1,
    name: 'Producto de Prueba',
    short_description: 'Descripción corta',
    full_description: 'Descripción completa del producto',
    stock: 10,
    price: '1500.00',
    discount: 20,
    image_url: 'https://example.com/image.jpg',
    brand_id: 1,
    model: 'MODEL-2024',
    metadata: { color: 'Negro', peso: '2kg' },
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    deleted_at: null,
    brand: {
        id: 1,
        name: 'Marca Prueba',
        slug: 'marca-prueba',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
    },
    availability: 'Disponible',
    discounted_price: '1200.00',
    cover_image: 'https://example.com/image.jpg',
};

describe('ProductShow - WhatsApp button', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows WhatsApp button when stock is greater than zero', () => {
        render(<ProductShow product={mockProduct} />);

        const button = screen.getByRole('link', {
            name: /consultar por whatsapp/i,
        });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute(
            'href',
            expect.stringContaining('wa.me/5491123456789'),
        );
        const encodedText =
            button.getAttribute('href')?.split('text=')[1] ?? '';
        const decodedText = decodeURIComponent(encodedText);
        expect(decodedText).toContain('Producto de Prueba');
        expect(decodedText).toContain('MODEL-2024');
    });

    it('hides WhatsApp button when stock is zero', () => {
        const outOfStockProduct = {
            ...mockProduct,
            stock: 0,
            availability: 'Agotado',
        };
        render(<ProductShow product={outOfStockProduct} />);

        expect(
            screen.queryByRole('link', { name: /consultar por whatsapp/i }),
        ).not.toBeInTheDocument();
    });
});

describe('ProductShow - rich text description', () => {
    it('uses theme-aware typography styles', () => {
        render(<ProductShow product={mockProduct} />);

        expect(
            screen.getByText('Descripción completa del producto'),
        ).toHaveClass('prose', 'prose-themed');
    });
});
