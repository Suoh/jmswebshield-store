import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from '@/components/ui/empty-state';

describe('EmptyState', () => {
    it('renders the title', () => {
        render(<EmptyState title="No hay productos" />);

        expect(screen.getByText('No hay productos')).toBeInTheDocument();
    });

    it('renders the description when provided', () => {
        render(
            <EmptyState
                title="Sin resultados"
                description="Probá cambiar los filtros"
            />,
        );

        expect(screen.getByText('Sin resultados')).toBeInTheDocument();
        expect(screen.getByText('Probá cambiar los filtros')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
        const { container } = render(<EmptyState title="Vacío" />);

        expect(container.querySelector('p + p')).not.toBeInTheDocument();
    });

    it('centers the content', () => {
        const { container } = render(<EmptyState title="Empty" />);

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('flex');
        expect(wrapper).toHaveClass('items-center');
        expect(wrapper).toHaveClass('justify-center');
    });
});
