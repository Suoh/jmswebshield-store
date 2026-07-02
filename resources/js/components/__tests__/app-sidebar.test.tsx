import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({
    Link: ({ children }: { href: string; children: React.ReactNode }) => (
        <>{children}</>
    ),
    usePage: () => ({
        props: {
            auth: { isAdmin: false },
        },
    }),
}));

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

describe('AppSidebar', () => {
    it('renders the brand logo in the sidebar header', () => {
        render(
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>,
        );

        expect(
            screen.getByRole('img', { name: 'JMS WebShield Store' }),
        ).toBeInTheDocument();
    });

    it('does not show admin navigation when user is not admin', () => {
        render(
            <SidebarProvider>
                <AppSidebar />
            </SidebarProvider>,
        );

        expect(screen.queryByText('Gestión')).not.toBeInTheDocument();
    });
});
