import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import { common, createLowlight } from 'lowlight';
import { Button } from '@/components/ui/button';
import {
    Bold,
    Italic,
    Heading3,
    Heading4,
    List,
    ListOrdered,
    Quote,
    Code,
    Code2,
    Minus,
    Link,
    Undo,
    Redo,
} from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

const lowlight = createLowlight(common);

interface ToolbarButton {
    label: string;
    icon: typeof Bold;
    action: () => void;
    isActive: () => boolean;
    disabled?: () => boolean;
}

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Escribe el contenido...',
    className,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                link: false,
                heading: {
                    levels: [3, 4],
                },
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            PlaceholderExtension.configure({
                placeholder,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== value) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    const toolbarButtons: ToolbarButton[] = [
        {
            label: 'Negritas',
            icon: Bold,
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: () => editor.isActive('bold'),
        },
        {
            label: 'Cursivas',
            icon: Italic,
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: () => editor.isActive('italic'),
        },
        {
            label: 'Título 3',
            icon: Heading3,
            action: () =>
                editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActive: () => editor.isActive('heading', { level: 3 }),
        },
        {
            label: 'Título 4',
            icon: Heading4,
            action: () =>
                editor.chain().focus().toggleHeading({ level: 4 }).run(),
            isActive: () => editor.isActive('heading', { level: 4 }),
        },
        {
            label: 'Lista',
            icon: List,
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: () => editor.isActive('bulletList'),
        },
        {
            label: 'Lista numerada',
            icon: ListOrdered,
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: () => editor.isActive('orderedList'),
        },
        {
            label: 'Cita',
            icon: Quote,
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: () => editor.isActive('blockquote'),
        },
        {
            label: 'Código',
            icon: Code,
            action: () => editor.chain().focus().toggleCode().run(),
            isActive: () => editor.isActive('code'),
        },
        {
            label: 'Bloque de código',
            icon: Code2,
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: () => editor.isActive('codeBlock'),
        },
        {
            label: 'Línea separadora',
            icon: Minus,
            action: () => editor.chain().focus().setHorizontalRule().run(),
            isActive: () => false,
        },
        {
            label: 'Enlace',
            icon: Link,
            action: () => {
                const url = window.prompt('URL:');
                if (url) {
                    editor
                        .chain()
                        .focus()
                        .extendMarkRange('link')
                        .setLink({ href: url })
                        .run();
                }
            },
            isActive: () => editor.isActive('link'),
        },
        {
            label: 'Deshacer',
            icon: Undo,
            action: () => editor.chain().focus().undo().run(),
            isActive: () => false,
            disabled: () => !editor.can().undo(),
        },
        {
            label: 'Rehacer',
            icon: Redo,
            action: () => editor.chain().focus().redo().run(),
            isActive: () => false,
            disabled: () => !editor.can().redo(),
        },
    ];

    return (
        <div
            className={cn(
                'flex flex-col rounded-xl border border-input/50 overflow-hidden',
                className,
            )}
        >
            {editor && (
                <>
                    <div className="flex flex-wrap items-center gap-0.5 border-b border-input/50 bg-muted/30 px-2 py-1.5">
                        {toolbarButtons.map((item) => (
                            <Button
                                key={item.label}
                                type="button"
                                variant={
                                    item.isActive() ? 'default' : 'ghost'
                                }
                                size="icon"
                                aria-label={item.label}
                                disabled={item.disabled?.()}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    item.action();
                                }}
                                className="size-8"
                            >
                                <item.icon className="size-3.5" />
                            </Button>
                        ))}
                    </div>
                    <EditorContent
                        editor={editor}
                        role="textbox"
                        aria-multiline="true"
                        className="prose prose-sm max-w-none
                            [&_.ProseMirror]:min-h-[120px]
                            [&_.ProseMirror]:px-3
                            [&_.ProseMirror]:py-2
                            [&_.ProseMirror]:outline-none
                            [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground
                            [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
                            [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
                            [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
                    />
                </>
            )}
        </div>
    );
}
