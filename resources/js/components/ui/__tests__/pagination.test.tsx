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
            { url: null, label: '&laquo; Anterior', active: false },
            { url: 'http://example.test?page=1', label: '1', active: true },
            { url: null, label: 'Siguiente &raquo;', active: false },
        ];

        render(<Pagination links={links} />);

        expect(
            screen.getByRole('button', { name: '« Anterior' }),
        ).toBeDisabled();
        expect(
            screen.getByRole('button', { name: 'Siguiente »' }),
        ).toBeDisabled();
    });

    it('decodes &laquo; and &raquo; HTML entities from labels', () => {
        const links = [
            { url: null, label: '&laquo; Anterior', active: false },
            { url: 'http://example.test?page=1', label: '1', active: true },
            { url: null, label: 'Siguiente &raquo;', active: false },
        ];

        render(<Pagination links={links} />);

        expect(screen.getByText('« Anterior')).toBeInTheDocument();
        expect(screen.getByText('Siguiente »')).toBeInTheDocument();

        expect(
            screen.queryByText('&laquo; Anterior', { exact: false }),
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
            { url: null, label: 'Siguiente &raquo;', active: false },
            { url: 'http://example.test?page=1', label: '1', active: true },
        ];

        render(<Pagination links={links} />);

        fireEvent.click(screen.getByRole('button', { name: 'Siguiente »' }));

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

    describe('onPageChange callback mode', () => {
        it('uses onPageChange instead of links when provided', () => {
            const onPageChange = vi.fn();

            render(
                <Pagination
                    currentPage={2}
                    lastPage={5}
                    onPageChange={onPageChange}
                />,
            );

            fireEvent.click(screen.getByRole('button', { name: '3' }));

            expect(onPageChange).toHaveBeenCalledWith(3);
            expect(router.get).not.toHaveBeenCalled();
        });

        it('disables Previous button on first page', () => {
            render(
                <Pagination
                    currentPage={1}
                    lastPage={5}
                    onPageChange={vi.fn()}
                />,
            );

            expect(
                screen.getByRole('button', { name: 'Anterior' }),
            ).toBeDisabled();
        });

        it('disables Next button on last page', () => {
            render(
                <Pagination
                    currentPage={5}
                    lastPage={5}
                    onPageChange={vi.fn()}
                />,
            );

            expect(
                screen.getByRole('button', { name: 'Siguiente' }),
            ).toBeDisabled();
        });

        it('renders all page numbers when lastPage <= 12', () => {
            render(
                <Pagination
                    currentPage={2}
                    lastPage={4}
                    onPageChange={vi.fn()}
                />,
            );

            expect(
                screen.getByRole('button', { name: 'Anterior' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Siguiente' }),
            ).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
        });

        it('renders ellipsis when there are many pages', () => {
            render(
                <Pagination
                    currentPage={25}
                    lastPage={50}
                    onPageChange={vi.fn()}
                />,
            );

            expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
            expect(screen.getAllByText('...')).toHaveLength(2);
            expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
        });

        it('highlights the current page in callback mode', () => {
            render(
                <Pagination
                    currentPage={3}
                    lastPage={5}
                    onPageChange={vi.fn()}
                />,
            );

            const currentPageButton = screen.getByRole('button', { name: '3' });
            expect(currentPageButton.className).toContain('bg-primary');
        });

        it('Previous button calls onPageChange with currentPage - 1', () => {
            const onPageChange = vi.fn();

            render(
                <Pagination
                    currentPage={3}
                    lastPage={5}
                    onPageChange={onPageChange}
                />,
            );

            fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));

            expect(onPageChange).toHaveBeenCalledWith(2);
        });

        it('Next button calls onPageChange with currentPage + 1', () => {
            const onPageChange = vi.fn();

            render(
                <Pagination
                    currentPage={3}
                    lastPage={5}
                    onPageChange={onPageChange}
                />,
            );

            fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));

            expect(onPageChange).toHaveBeenCalledWith(4);
        });

        it('renders page window centered on current page', () => {
            render(
                <Pagination
                    currentPage={25}
                    lastPage={50}
                    onPageChange={vi.fn()}
                />,
            );

            expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '25' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '29' })).toBeInTheDocument();
        });

        it('renders first page and last page with ellipsis on each end', () => {
            render(
                <Pagination
                    currentPage={25}
                    lastPage={50}
                    onPageChange={vi.fn()}
                />,
            );

            const buttons = screen.getAllByText('...');
            expect(buttons).toHaveLength(2);
        });

        it('does not render ellipsis when near first page', () => {
            render(
                <Pagination
                    currentPage={3}
                    lastPage={50}
                    onPageChange={vi.fn()}
                />,
            );

            expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument();
            expect(screen.getByText('...')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
        });

        it('does not render ellipsis when near last page', () => {
            render(
                <Pagination
                    currentPage={48}
                    lastPage={50}
                    onPageChange={vi.fn()}
                />,
            );

            expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
            expect(screen.getByText('...')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '41' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
        });
    });

    describe('links mode with currentPage and lastPage', () => {
        const baseLinks = [
            { url: 'http://example.test?page=1', label: '1', active: true },
            { url: 'http://example.test?page=2', label: '2', active: false },
            { url: 'http://example.test?page=3', label: '3', active: false },
        ];

        it('renders Previous and Next when links contain them', () => {
            const links = [
                { url: null, label: '&laquo; Previous', active: false },
                ...baseLinks,
                { url: null, label: 'Next &raquo;', active: false },
            ];

            render(
                <Pagination
                    links={links}
                    currentPage={1}
                    lastPage={3}
                />,
            );

            expect(
                screen.getByRole('button', { name: '« Anterior' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Siguiente »' }),
            ).toBeInTheDocument();
        });

        it('navigates via router.get when a page button is clicked', () => {
            const links = [
                { url: null, label: '&laquo; Previous', active: false },
                { url: 'http://example.test?page=2', label: '2', active: false },
                { url: null, label: 'Next &raquo;', active: false },
            ];

            render(
                <Pagination
                    links={links}
                    currentPage={1}
                    lastPage={3}
                />,
            );

            fireEvent.click(screen.getByRole('button', { name: '2' }));

            expect(router.get).toHaveBeenCalledWith(
                'http://example.test?page=2',
            );
        });
    });
});
