import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const appearanceMock = vi.hoisted(() => ({
    resolvedAppearance: 'light' as 'light' | 'dark',
    updateAppearance: vi.fn(),
}));

vi.mock('@/hooks/use-appearance', () => ({
    useAppearance: () => appearanceMock,
}));

import AppearanceToggle from '@/components/appearance-toggle';

describe('AppearanceToggle', () => {
    beforeEach(() => {
        appearanceMock.resolvedAppearance = 'light';
        appearanceMock.updateAppearance.mockClear();
    });

    it('switches from light to dark', () => {
        render(<AppearanceToggle />);

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Cambiar a tema oscuro',
            }),
        );

        expect(appearanceMock.updateAppearance).toHaveBeenCalledWith('dark');
    });

    it('switches from dark to light', () => {
        appearanceMock.resolvedAppearance = 'dark';
        render(<AppearanceToggle />);

        fireEvent.click(
            screen.getByRole('button', {
                name: 'Cambiar a tema claro',
            }),
        );

        expect(appearanceMock.updateAppearance).toHaveBeenCalledWith('light');
    });
});
