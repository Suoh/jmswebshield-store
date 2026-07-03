import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({
    Link: ({ children, href }: { href: string; children: React.ReactNode }) => (
        <a href={href}>{children}</a>
    ),
    usePage: () => ({
        props: {
            auth: { isAdmin: false },
        },
    }),
}));

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

describe('AppSidebar', () => {
    const renderSidebar = () =>
        render(
            <TooltipProvider>
                <SidebarProvider>
                    <AppSidebar />
                </SidebarProvider>
            </TooltipProvider>,
        );

    it('renders the brand logo in the sidebar header', () => {
        renderSidebar();

        expect(
            screen.getByRole('img', { name: 'JMS WebShield Store' }),
        ).toBeInTheDocument();
    });

    it('does not show admin navigation when user is not admin', () => {
        renderSidebar();

        expect(screen.queryByText('Gestión')).not.toBeInTheDocument();
    });

    it('shows "Ir a la tienda" link that points to /products', () => {
        renderSidebar();

        const link = screen.getByRole('link', { name: 'Ir a la tienda' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/products');
    });

    it('shows "Tienda" group label', () => {
        renderSidebar();

        expect(screen.getByText('Tienda')).toBeInTheDocument();
    });
});
