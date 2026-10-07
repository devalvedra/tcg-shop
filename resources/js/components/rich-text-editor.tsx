import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Heading2,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo2,
    RemoveFormatting,
    Strikethrough,
    Undo2,
} from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';

type Props = {
    id?: string;
    value: string;
    onChange: (html: string) => void;
};

export function RichTextEditor({ id, value, onChange }: Props) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                ...(id ? { id } : {}),
                class: 'min-h-28 px-3 py-2 text-sm outline-none',
            },
        },
    });

    useEffect(() => {
        if (editor && editor.getHTML() !== value) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    if (!editor) {
        return null;
    }

    const toolButtonClasses = (active: boolean) =>
        `size-8 ${active ? 'bg-muted text-foreground' : 'text-muted-foreground'}`;

    return (
        <div className="overflow-hidden rounded-md border border-input bg-background shadow-xs">
            <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/50 p-1.5">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolButtonClasses(editor.isActive('bold'))}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title={t('Bold')}
                >
                    <Bold className="size-4" />
                    <span className="sr-only">{t('Bold')}</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolButtonClasses(editor.isActive('italic'))}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title={t('Italic')}
                >
                    <Italic className="size-4" />
                    <span className="sr-only">{t('Italic')}</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolButtonClasses(editor.isActive('strike'))}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    title={t('Strikethrough')}
                >
                    <Strikethrough className="size-4" />
                    <span className="sr-only">{t('Strikethrough')}</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolButtonClasses(
                        editor.isActive('heading', { level: 2 }),
                    )}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    title={t('Heading')}
                >
                    <Heading2 className="size-4" />
                    <span className="sr-only">{t('Heading')}</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolButtonClasses(editor.isActive('bulletList'))}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    title={t('Bullet list')}
                >
                    <List className="size-4" />
                    <span className="sr-only">{t('Bullet list')}</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolButtonClasses(
                        editor.isActive('orderedList'),
                    )}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    title={t('Numbered list')}
                >
                    <ListOrdered className="size-4" />
                    <span className="sr-only">{t('Numbered list')}</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolButtonClasses(editor.isActive('blockquote'))}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    title={t('Quote')}
                >
                    <Quote className="size-4" />
                    <span className="sr-only">{t('Quote')}</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolButtonClasses(false)}
                    onClick={() => editor.chain().focus().undo().run()}
                    title={t('Undo')}
                >
                    <Undo2 className="size-4" />
                    <span className="sr-only">{t('Undo')}</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolButtonClasses(false)}
                    onClick={() => editor.chain().focus().redo().run()}
                    title={t('Redo')}
                >
                    <Redo2 className="size-4" />
                    <span className="sr-only">{t('Redo')}</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={toolButtonClasses(false)}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .clearNodes()
                            .unsetAllMarks()
                            .run()
                    }
                    title={t('Clear formatting')}
                >
                    <RemoveFormatting className="size-4" />
                    <span className="sr-only">{t('Clear formatting')}</span>
                </Button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
