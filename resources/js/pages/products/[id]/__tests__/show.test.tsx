import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
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
    msi_3_months: false,
    msi_6_months: false,
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

describe('ProductShow - installments', () => {
    it('keeps the original inquiry when no installments are enabled', () => {
        render(<ProductShow product={mockProduct} />);
        expect(
            screen.queryByRole('group', { name: 'Opciones de pago' }),
        ).not.toBeInTheDocument();
        const href = screen
            .getByRole('link', { name: /consultar por whatsapp/i })
            .getAttribute('href')!;
        expect(decodeURIComponent(href)).not.toContain('preferencia');
    });

    it('starts at cash and sends the selected discounted installment to WhatsApp', () => {
        render(
            <ProductShow
                product={{
                    ...mockProduct,
                    msi_3_months: true,
                    msi_6_months: true,
                }}
            />,
        );
        const cash = screen.getByRole('radio', {
            name: 'Pago de contado: $1,200.00',
        });
        expect(cash).toBeChecked();
        const message = () =>
            decodeURIComponent(
                screen
                    .getByRole('link', { name: /consultar por whatsapp/i })
                    .getAttribute('href')!,
            );
        expect(message()).toContain('pago de contado por $1,200.00');
        fireEvent.click(
            screen.getByRole('radio', {
                name: '3 meses sin intereses de $400.00',
            }),
        );
        expect(message()).toContain(
            '3 meses sin intereses de $400.00 al mes (total: $1,200.00)',
        );
        fireEvent.click(
            screen.getByRole('radio', {
                name: '6 meses sin intereses de $200.00',
            }),
        );
        expect(message()).toContain('6 meses sin intereses de $200.00');
        expect(message()).toContain(mockProduct.name);
        expect(message()).toContain(mockProduct.model);
        expect(message()).toContain(window.location.href);
        fireEvent.click(cash);
        expect(message()).toContain('pago de contado');
    });

    it.each([3, 6])(
        'shows only the enabled %i-month option and rounds cents',
        (months) => {
            render(
                <ProductShow
                    product={{
                        ...mockProduct,
                        price: '1000.00',
                        discounted_price: null,
                        discount: 0,
                        msi_3_months: months === 3,
                        msi_6_months: months === 6,
                    }}
                />,
            );
            expect(screen.getAllByRole('radio')).toHaveLength(2);
            expect(
                screen.getByRole('radio', {
                    name: `${months} meses sin intereses de $${months === 3 ? '333.33' : '166.67'}`,
                }),
            ).toBeInTheDocument();
        },
    );

    it('uses a zero discounted price rather than the original price', () => {
        render(
            <ProductShow
                product={{
                    ...mockProduct,
                    discounted_price: '0.00',
                    discount: 100,
                    msi_3_months: true,
                }}
            />,
        );
        expect(
            screen.getByRole('radio', { name: 'Pago de contado: $0.00' }),
        ).toBeChecked();
        expect(
            screen.getByRole('radio', {
                name: '3 meses sin intereses de $0.00',
            }),
        ).toBeInTheDocument();
    });

    it('resets the choice when navigating to another product', () => {
        const product = { ...mockProduct, msi_3_months: true };
        const { rerender } = render(<ProductShow product={product} />);
        fireEvent.click(screen.getByRole('radio', { name: /3 meses/ }));
        rerender(<ProductShow product={{ ...product, id: 2 }} />);
        expect(
            screen.getByRole('radio', { name: /Pago de contado/ }),
        ).toBeChecked();
    });
});
