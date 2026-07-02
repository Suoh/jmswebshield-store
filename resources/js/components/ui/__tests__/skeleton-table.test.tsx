import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkeletonTable } from '@/components/ui/skeleton-table';

describe('SkeletonTable', () => {
    it('renders the default 10 rows by default', () => {
        render(
            <table>
                <tbody>
                    <SkeletonTable columns={4} />
                </tbody>
            </table>,
        );

        expect(screen.getAllByRole('row')).toHaveLength(10);
    });

    it('renders the specified number of rows', () => {
        render(
            <table>
                <tbody>
                    <SkeletonTable columns={3} rows={5} />
                </tbody>
            </table>,
        );

        expect(screen.getAllByRole('row')).toHaveLength(5);
    });

    it('renders the correct number of cells per row', () => {
        const { container } = render(
            <table>
                <tbody>
                    <SkeletonTable columns={3} rows={2} />
                </tbody>
            </table>,
        );

        const rows = container.querySelectorAll('tr');
        expect(rows).toHaveLength(2);
        expect(rows[0].querySelectorAll('td')).toHaveLength(3);
        expect(rows[1].querySelectorAll('td')).toHaveLength(3);
    });

    it('applies custom className to the container', () => {
        const { container } = render(
            <div data-testid="wrapper">
                <table>
                    <tbody>
                        <SkeletonTable columns={2} rows={1} className="custom-class" />
                    </tbody>
                </table>
            </div>,
        );

        const wrapper = container.querySelector(
            '[data-testid="wrapper"]',
        ) as HTMLElement;
        expect(wrapper).toBeTruthy();
    });
});
