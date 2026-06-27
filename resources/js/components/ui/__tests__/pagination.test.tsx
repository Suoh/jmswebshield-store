import '@testing-library/jest-dom/vitest';

import { router } from '@inertiajs/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Pagination } from '@/components/ui/pagination';

vi.mock('@inertiajs/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@inertiajs/react')>();
    return {
        ...actual,
        router: {
            get: vi.fn(),
        },
    };
});

describe('Pagination', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders a button for each link', () => {
        const links = [
            { url: 'http://example.test?page=1', label: '1', active: true },
            { url: 'http://example.test?page=2', label: '2', active: false },
            { url: 'http://example.test?page=3', label: '3', active: false },
        ];

        render(<Pagination links={links} />);

        expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    });

    it('highlights the active page with the default variant', () => {
        const links = [
            { url: 'http://example.test?page=1', label: '1', active: false },
            { url: 'http://example.test?page=2', label: '2', active: true },
            { url: 'http://example.test?page=3', label: '3', active: false },
        ];

        render(<Pagination links={links} />);

        const activeButton = screen.getByRole('button', { name: '2' });
        expect(activeButton.className).toContain('bg-primary');
    });

    it('disables buttons whose url is null', () => {
        const links = [
            { url: null, label: '&laquo; Previous', active: false },
            { url: 'http://example.test?page=1', label: '1', active: true },
            { url: null, label: 'Next &raquo;', active: false },
        ];

        render(<Pagination links={links} />);

        expect(
            screen.getByRole('button', { name: '« Previous' }),
        ).toBeDisabled();
        expect(
            screen.getByRole('button', { name: 'Next »' }),
        ).toBeDisabled();
    });

    it('decodes &laquo; and &raquo; HTML entities from labels', () => {
        const links = [
            { url: null, label: '&laquo; Previous', active: false },
            { url: 'http://example.test?page=1', label: '1', active: true },
            { url: null, label: 'Next &raquo;', active: false },
        ];

        render(<Pagination links={links} />);

        expect(screen.getByText('« Previous')).toBeInTheDocument();
        expect(screen.getByText('Next »')).toBeInTheDocument();

        expect(
            screen.queryByText('&laquo; Previous', { exact: false }),
        ).not.toBeInTheDocument();
    });

    it('navigates via router.get when a button is clicked', () => {
        const links = [
            { url: 'http://example.test?page=1', label: '1', active: true },
            { url: 'http://example.test?page=2', label: '2', active: false },
        ];

        render(<Pagination links={links} />);

        fireEvent.click(screen.getByRole('button', { name: '2' }));

        expect(router.get).toHaveBeenCalledWith(
            'http://example.test?page=2',
        );
        expect(router.get).toHaveBeenCalledTimes(1);
    });

    it('does not navigate when a disabled button is clicked', () => {
        const links = [
            { url: null, label: 'Next &raquo;', active: false },
            { url: 'http://example.test?page=1', label: '1', active: true },
        ];

        render(<Pagination links={links} />);

        fireEvent.click(screen.getByRole('button', { name: 'Next »' }));

        expect(router.get).not.toHaveBeenCalled();
    });

    it('applies a custom className when provided', () => {
        const links = [
            { url: 'http://example.test?page=1', label: '1', active: true },
        ];

        const { container } = render(
            <Pagination links={links} className="mt-8 flex-wrap" />,
        );

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('mt-8');
        expect(wrapper).toHaveClass('flex-wrap');
    });
});
