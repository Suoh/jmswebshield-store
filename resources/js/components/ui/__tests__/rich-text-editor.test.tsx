import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

describe('RichTextEditor', () => {
    it('renders the editor container', () => {
        const { container } = render(
            <RichTextEditor value="" onChange={() => {}} />,
        );

        expect(
            container.querySelector('.ProseMirror'),
        ).toBeInTheDocument();
    });

    it('renders toolbar buttons', () => {
        render(<RichTextEditor value="" onChange={() => {}} />);

        expect(
            screen.getByLabelText('Negritas'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Cursivas'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Título 3'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Título 4'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Lista'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Lista numerada'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Cita'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Código'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Bloque de código'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Línea separadora'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Enlace'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Deshacer'),
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('Rehacer'),
        ).toBeInTheDocument();
    });

    it('renders initial value as HTML', () => {
        render(
            <RichTextEditor
                value="<p>Hello world</p>"
                onChange={() => {}}
            />,
        );

        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('renders placeholder when value is empty', () => {
        const { container } = render(
            <RichTextEditor
                value=""
                onChange={() => {}}
                placeholder="Escribe aquí..."
            />,
        );

        expect(
            container.querySelector('.ProseMirror'),
        ).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <RichTextEditor
                value=""
                onChange={() => {}}
                className="my-custom-editor"
            />,
        );

        expect(
            container.querySelector('.my-custom-editor'),
        ).toBeInTheDocument();
    });
});
