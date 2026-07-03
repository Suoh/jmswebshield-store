import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductImageUploader from '@/components/admin/product-image-uploader';
import type { ProductImage } from '@/types/models';

vi.mock('@inertiajs/react', () => ({
    router: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        post: vi.fn(),
    },
    usePage: vi.fn(() => ({})),
}));

function makeImage(overrides: Partial<ProductImage> = {}): ProductImage {
    return {
        id: 1,
        product_id: 1,
        path: 'products/1/test.png',
        position: 0,
        is_cover: false,
        url: 'http://localhost/storage/products/1/test.png',
        created_at: '2026-07-02T00:00:00.000000Z',
        updated_at: '2026-07-02T00:00:00.000000Z',
        ...overrides,
    };
}

describe('ProductImageUploader delete dialog', () => {
    it('does not show the confirmation dialog initially', () => {
        const images = [makeImage({ id: 1, is_cover: true })];

        render(
            <ProductImageUploader
                productId={1}
                images={images}
                onImagesChange={vi.fn()}
            />,
        );

        expect(
            screen.queryByText(
                '¿Estás seguro de que deseas eliminar esta imagen?',
            ),
        ).not.toBeInTheDocument();
    });

    it('opens the confirmation dialog when clicking Eliminar imagen', () => {
        const images = [makeImage({ id: 1, is_cover: true })];

        render(
            <ProductImageUploader
                productId={1}
                images={images}
                onImagesChange={vi.fn()}
            />,
        );

        const deleteButton = screen.getByTitle('Eliminar imagen');
        fireEvent.click(deleteButton);

        expect(
            screen.getByText(
                '¿Estás seguro de que deseas eliminar esta imagen?',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Cancelar' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Eliminar' }),
        ).toBeInTheDocument();
    });

    it('only opens the dialog for the clicked image, not all of them', () => {
        const images = [
            makeImage({ id: 10, is_cover: true }),
            makeImage({ id: 20, is_cover: false, position: 1 }),
        ];

        render(
            <ProductImageUploader
                productId={1}
                images={images}
                onImagesChange={vi.fn()}
            />,
        );

        const deleteButtons = screen.getAllByTitle('Eliminar imagen');
        expect(deleteButtons).toHaveLength(2);

        fireEvent.click(deleteButtons[0]);

        expect(
            screen.getByText(
                '¿Estás seguro de que deseas eliminar esta imagen?',
            ),
        ).toBeInTheDocument();

        const headings = screen.getAllByText('Eliminar imagen', {
            selector: 'h2, [role="heading"]',
        });
        expect(headings).toHaveLength(1);
    });

    it('closes the dialog when clicking Cancelar', () => {
        const images = [makeImage({ id: 1, is_cover: true })];

        render(
            <ProductImageUploader
                productId={1}
                images={images}
                onImagesChange={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByTitle('Eliminar imagen'));

        expect(
            screen.getByText(
                '¿Estás seguro de que deseas eliminar esta imagen?',
            ),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(
            screen.queryByText(
                '¿Estás seguro de que deseas eliminar esta imagen?',
            ),
        ).not.toBeInTheDocument();
    });
});
