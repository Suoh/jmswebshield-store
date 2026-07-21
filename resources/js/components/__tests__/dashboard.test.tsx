import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
}));

import Dashboard from '@/pages/dashboard';

describe('Dashboard', () => {
    it('renders the brand logo in the hero section', () => {
        render(<Dashboard />);

        expect(
            screen.getByRole('img', { name: 'JMS WebShield Store' }),
        ).toBeInTheDocument();
    });

    it('renders the admin panel badge', () => {
        render(<Dashboard />);

        expect(
            screen.getByText('Panel admin JMS WebShield Store'),
        ).toBeInTheDocument();
    });

    it('renders the "Ir a la tienda" button', () => {
        render(<Dashboard />);

        const button = screen.getByRole('link', {
            name: /Ir a la tienda/i,
        });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('href', '/products');
    });

    it('renders the six admin section cards', () => {
        render(<Dashboard />);

        expect(screen.getByText('Productos')).toBeInTheDocument();
        expect(screen.getByText('Marcas')).toBeInTheDocument();
        expect(screen.getByText('Categorías')).toBeInTheDocument();
        expect(screen.getByText('SYSCOM Marcas')).toBeInTheDocument();
        expect(screen.getByText('SYSCOM Categorías')).toBeInTheDocument();
        expect(screen.getByText('SYSCOM Productos')).toBeInTheDocument();
    });
});
