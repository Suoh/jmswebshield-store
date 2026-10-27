import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({ router: { get: vi.fn() } }));
import SortSelect from '../sort-select';

afterEach(() => window.history.replaceState({}, '', '/'));

describe('catalog default sort', () => {
    it('shows A-Z on the default catalog', () => {
        render(<SortSelect />);
        expect(screen.getByRole('combobox')).toHaveTextContent('Nombre: A-Z');
    });

    it.each([
        ['?sort=created_at&order=desc', 'Más recientes'],
        ['?sort=price&order=desc', 'Precio: mayor a menor'],
        ['?sort=price&order=asc', 'Precio: menor a mayor'],
        ['?search=Camera', 'Nombre: A-Z'],
    ])('reflects %s', (query, label) => {
        window.history.replaceState({}, '', `/products${query}`);
        render(<SortSelect />);
        expect(screen.getByRole('combobox')).toHaveTextContent(label);
    });
});
