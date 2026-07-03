import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AppLogo from '@/components/app-logo';

describe('AppLogo', () => {
    it('renders JMS WebShield Store brand instead of Laravel Starter Kit', () => {
        render(<AppLogo />);

        expect(
            screen.queryByText('Laravel Starter Kit'),
        ).not.toBeInTheDocument();
        expect(screen.getByText('JMS WebShield Store')).toBeInTheDocument();
    });

    it('renders the brand image with alt text', () => {
        render(<AppLogo />);

        expect(
            screen.getByRole('img', { name: 'JMS WebShield Store' }),
        ).toBeInTheDocument();
    });
});
