import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BrandName from '@/components/product/brand-name';

describe('BrandName', () => {
    it('renders "Sin marca" when brand is null', () => {
        render(<BrandName brand={null} />);

        expect(screen.getByText('Sin marca')).toBeInTheDocument();
    });

    it('renders "Sin marca" when brand is undefined', () => {
        render(<BrandName brand={undefined} />);

        expect(screen.getByText('Sin marca')).toBeInTheDocument();
    });

    it('renders "Sin marca" when brand name is "sinmarca"', () => {
        render(
            <BrandName
                brand={{
                    id: 1,
                    name: 'sinmarca',
                    slug: 'sinmarca',
                    created_at: '',
                    updated_at: '',
                }}
            />,
        );

        expect(screen.getByText('Sin marca')).toBeInTheDocument();
    });

    it('renders the brand name when brand has a valid name', () => {
        render(
            <BrandName
                brand={{
                    id: 1,
                    name: 'Acme Corp',
                    slug: 'acme-corp',
                    created_at: '',
                    updated_at: '',
                }}
            />,
        );

        expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    });
});
