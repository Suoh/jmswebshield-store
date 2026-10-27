import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { page, patch } = vi.hoisted(() => ({
    page: { url: '/admin/products', props: {} as Record<string, unknown> },
    patch: vi.fn(),
}));

vi.mock('@inertiajs/react', () => ({
    usePage: () => page,
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
    router: { patch, get: vi.fn() },
}));

import AdminProductsIndex from '../index';

beforeEach(() => {
    patch.mockReset();
    page.url = '/admin/products';
    page.props = {
        products: {
            data: [
                {
                    id: 1,
                    name: 'Camera',
                    price: '900',
                    stock: 1,
                    is_active: true,
                    deleted_at: null,
                },
                {
                    id: 2,
                    name: 'Monitor',
                    price: '1500',
                    stock: 1,
                    is_active: true,
                    deleted_at: null,
                },
                {
                    id: 3,
                    name: 'Deleted',
                    price: '100',
                    stock: 0,
                    is_active: false,
                    deleted_at: '2026-01-01',
                },
            ],
            current_page: 1,
            last_page: 1,
        },
        brands: [],
        filters: {},
    };
});

describe('admin installment selection', () => {
    it('selects the current page while excluding deleted products', () => {
        render(<AdminProductsIndex />);
        expect(
            screen.getByRole('checkbox', { name: 'Seleccionar Deleted' }),
        ).toBeDisabled();
        fireEvent.click(
            screen.getByRole('checkbox', { name: /Seleccionar todos/ }),
        );
        expect(
            screen.getByText('2 productos seleccionados'),
        ).toBeInTheDocument();
        fireEvent.change(screen.getByLabelText('Meses sin intereses'), {
            target: { value: 'both' },
        });
        fireEvent.click(
            screen.getByRole('button', { name: 'Aplicar a seleccionados' }),
        );
        expect(patch).toHaveBeenCalledWith(
            '/admin/products/installments',
            {
                product_ids: [1, 2],
                msi_3_months: true,
                msi_6_months: true,
            },
            expect.any(Object),
        );
        expect(
            screen.getByRole('button', { name: 'Aplicando…' }),
        ).toBeDisabled();
        act(() => {
            patch.mock.calls[0][2].onSuccess();
            patch.mock.calls[0][2].onFinish();
        });
        expect(
            screen.queryByText(/productos seleccionados/),
        ).not.toBeInTheDocument();
    });

    it.each(['3', '6', 'none'])(
        'applies %s only to individually selected products',
        (value) => {
            render(<AdminProductsIndex />);
            fireEvent.click(
                screen.getByRole('checkbox', { name: 'Seleccionar Monitor' }),
            );
            fireEvent.change(screen.getByLabelText('Meses sin intereses'), {
                target: { value },
            });
            fireEvent.click(
                screen.getByRole('button', { name: 'Aplicar a seleccionados' }),
            );
            expect(patch.mock.calls[0][1]).toEqual({
                product_ids: [2],
                msi_3_months: value === '3',
                msi_6_months: value === '6',
            });
        },
    );

    it.each(['/admin/products?page=2', '/admin/products?search=Camera'])(
        'clears selection when navigating to %s',
        (url) => {
            const { rerender } = render(<AdminProductsIndex />);
            fireEvent.click(
                screen.getByRole('checkbox', { name: 'Seleccionar Camera' }),
            );
            page.url = url;
            rerender(<AdminProductsIndex />);
            expect(
                screen.getByRole('checkbox', { name: 'Seleccionar Camera' }),
            ).not.toBeChecked();
            expect(
                screen.queryByText(/productos seleccionados/),
            ).not.toBeInTheDocument();
        },
    );

    it('shows errors and retains the selection for retry', () => {
        render(<AdminProductsIndex />);
        fireEvent.click(
            screen.getByRole('checkbox', { name: 'Seleccionar Camera' }),
        );
        fireEvent.click(
            screen.getByRole('button', { name: 'Aplicar a seleccionados' }),
        );
        act(() => {
            patch.mock.calls[0][2].onError({
                product_ids: 'Producto no disponible',
            });
            patch.mock.calls[0][2].onFinish();
        });
        expect(screen.getByRole('alert')).toHaveTextContent(
            'Producto no disponible',
        );
        expect(
            screen.getByRole('checkbox', { name: 'Seleccionar Camera' }),
        ).toBeChecked();
    });
});
