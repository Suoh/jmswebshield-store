import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockUsePage = vi.fn(() => ({
    props: {
        auth: { user: null },
    },
}));

vi.mock('@inertiajs/react', () => ({
    Head: ({ title }: { title: string }) => <title>{title}</title>,
    Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
    usePage: () => mockUsePage(),
}));

import StorefrontLayout from '@/layouts/storefront/storefront-layout';

describe('StorefrontLayout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePage.mockReturnValue({
            props: { auth: { user: null } },
        });
    });

    it('renders the logo inside a link to home', () => {
        render(
            <StorefrontLayout>
                <div>Content</div>
            </StorefrontLayout>,
        );

        const logoLink = screen.getByRole('link', {
            name: /JMS WebShield Store/i,
        });
        expect(logoLink).toHaveAttribute('href', '/');
    });

    it('shows "Iniciar sesión" when no user is logged in', () => {
        render(
            <StorefrontLayout>
                <div>Content</div>
            </StorefrontLayout>,
        );

        expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    });

    it('shows "Panel admin" when user is logged in', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockUsePage.mockReturnValue({
            props: { auth: { user: { id: 1, name: 'Admin' } as any } },
        });

        render(
            <StorefrontLayout>
                <div>Content</div>
            </StorefrontLayout>,
        );

        expect(screen.getByText('Panel admin')).toBeInTheDocument();
    });

    it('renders children content', () => {
        render(
            <StorefrontLayout>
                <p>Catálogo de productos</p>
            </StorefrontLayout>,
        );

        expect(screen.getByText('Catálogo de productos')).toBeInTheDocument();
    });
});
