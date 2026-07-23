import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { uploadEditorImage } from '@/lib/editor-image-upload';

vi.mock('@/lib/editor-image-upload', () => ({
    uploadEditorImage: vi.fn(),
    generateSessionId: vi.fn(() => 'test-session-id'),
    getSessionStorageKey: vi.fn(() => 'test-key'),
    getOrCreateSessionId: vi.fn(() => 'test-session-id'),
}));

describe('RichTextEditor', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the editor container', () => {
        const { container } = render(
            <RichTextEditor value="" onChange={() => {}} />,
        );

        expect(
            container.querySelector('.ProseMirror'),
        ).toBeInTheDocument();
        expect(
            container.querySelector('.prose.prose-themed'),
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

    it('shows image button when endpoint and sessionId are provided', () => {
        render(
            <RichTextEditor
                value=""
                onChange={() => {}}
                imageUploadEndpoint="/admin/editor-images"
                imageSessionId="session-123"
            />,
        );

        expect(screen.getByLabelText('Imagen')).toBeInTheDocument();
    });

    it('does not show image button when props are missing', () => {
        render(<RichTextEditor value="" onChange={() => {}} />);

        expect(screen.queryByLabelText('Imagen')).not.toBeInTheDocument();
    });

    it('does not show image button when only endpoint is provided', () => {
        render(
            <RichTextEditor
                value=""
                onChange={() => {}}
                imageUploadEndpoint="/admin/editor-images"
            />,
        );

        expect(screen.queryByLabelText('Imagen')).not.toBeInTheDocument();
    });

    it('renders hidden file input when image upload is enabled', () => {
        const { container } = render(
            <RichTextEditor
                value=""
                onChange={() => {}}
                imageUploadEndpoint="/admin/editor-images"
                imageSessionId="session-123"
            />,
        );

        const input = container.querySelector(
            'input[type="file"]',
        ) as HTMLInputElement;
        expect(input).toBeInTheDocument();
        expect(input.accept).toBe('image/jpeg,image/png,image/webp');
    });
});
