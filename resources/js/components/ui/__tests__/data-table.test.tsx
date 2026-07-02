import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable } from '@/components/ui/data-table';

describe('DataTable', () => {
    it('renders column headers from the columns prop', () => {
        render(
            <DataTable columns={['Nombre', 'Slug', 'Acciones']} colSpan={3}>
                <tr>
                    <td>content</td>
                </tr>
            </DataTable>,
        );

        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Slug')).toBeInTheDocument();
        expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('renders the empty state when no children and not loading', () => {
        render(
            <DataTable
                columns={['A', 'B']}
                colSpan={2}
                emptyTitle="No hay datos"
            >
                {null}
            </DataTable>,
        );

        expect(screen.getByText('No hay datos')).toBeInTheDocument();
    });

    it('renders the empty state with description', () => {
        render(
            <DataTable
                columns={['A']}
                colSpan={1}
                emptyTitle="Sin resultados"
                emptyDescription="Probá cambiar los filtros"
            >
                {null}
            </DataTable>,
        );

        expect(screen.getByText('Sin resultados')).toBeInTheDocument();
        expect(screen.getByText('Probá cambiar los filtros')).toBeInTheDocument();
    });

    it('renders skeleton table when loading', () => {
        const { container } = render(
            <DataTable columns={['A', 'B', 'C']} colSpan={3} loading>
                {null}
            </DataTable>,
        );

        const rows = container.querySelectorAll('tbody tr');
        expect(rows.length).toBeGreaterThanOrEqual(10);
    });

    it('renders the children when provided and not loading', () => {
        render(
            <DataTable columns={['A']} colSpan={1}>
                <tr>
                    <td>row-1-data</td>
                </tr>
                <tr>
                    <td>row-2-data</td>
                </tr>
            </DataTable>,
        );

        expect(screen.getByText('row-1-data')).toBeInTheDocument();
        expect(screen.getByText('row-2-data')).toBeInTheDocument();
    });

    it('renders the footer when provided', () => {
        render(
            <DataTable
                columns={['A']}
                colSpan={1}
                footer={<div data-testid="footer-marker">pagination</div>}
            >
                <tr>
                    <td>row</td>
                </tr>
            </DataTable>,
        );

        expect(screen.getByTestId('footer-marker')).toBeInTheDocument();
    });

    it('does not render the footer when not provided', () => {
        const { container } = render(
            <DataTable columns={['A']} colSpan={1}>
                <tr>
                    <td>row</td>
                </tr>
            </DataTable>,
        );

        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.querySelector('[data-testid="footer-marker"]')).toBeNull();
    });

    it('renders ReactNode columns (e.g. for select-all checkboxes)', () => {
        render(
            <DataTable
                columns={[
                    <input key="select-all" type="checkbox" data-testid="select-all" />,
                    'Nombre',
                ]}
                colSpan={2}
            >
                <tr>
                    <td>row</td>
                </tr>
            </DataTable>,
        );

        expect(screen.getByTestId('select-all')).toBeInTheDocument();
        expect(screen.getByText('Nombre')).toBeInTheDocument();
    });
});
