'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useCallback, useState, useEffect } from 'react';

// LinkedIn character limit
const LINKEDIN_LIMIT = 3000;
const WARNING_THRESHOLD = 2800;

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Rich Text Editor using TipTap
 * 
 * Supports LinkedIn-compatible formatting:
 * - Bold
 * - Italic
 * - Bullet lists
 * - Numbered lists
 * - Links
 * 
 * Character limit: 3000 (LinkedIn limit)
 * Warning at: 2800 characters
 */
export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write your article content...',
  className,
  disabled = false,
}: RichTextEditorProps) {
  const [characterCount, setCharacterCount] = useState(0);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [isNearLimit, setIsNearLimit] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const count = text.length;
      setCharacterCount(count);
      setIsOverLimit(count > LINKEDIN_LIMIT);
      setIsNearLimit(count >= WARNING_THRESHOLD && count <= LINKEDIN_LIMIT);
      
      // Only update if under limit
      if (count <= LINKEDIN_LIMIT) {
        onChange(editor.getHTML());
      }
    },
    onCreate: ({ editor }) => {
      const text = editor.getText();
      setCharacterCount(text.length);
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Handle character limit
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!editor) return;
    
    const text = editor.getText();
    
    // Prevent typing if over limit (except for backspace, delete, arrows)
    if (text.length >= LINKEDIN_LIMIT) {
      const allowedKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
        'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab',
        'Escape', 'Enter', 'Control', 'Alt', 'Meta', 'Shift',
      ];
      
      if (!allowedKeys.includes(event.key) && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
      }
    }
  }, [editor]);

  // Toggle link
  const toggleLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href as string;
    
    if (previousUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      setShowLinkDialog(true);
      setLinkUrl('');
    }
  }, [editor]);

  // Set link
  const setLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    
    // Ensure URL has protocol
    let url = linkUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    editor.chain().focus().setLink({ href: url }).run();
    setShowLinkDialog(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  // Remove link
  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  if (!editor) {
    return (
      <div className={cn('min-h-[300px] rounded-md border bg-muted/30 animate-pulse', className)} />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 border rounded-md bg-muted/50 flex-wrap">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          aria-label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Toggle
          size="sm"
          pressed={editor.isActive('link')}
          onPressedChange={toggleLink}
          disabled={disabled}
          aria-label="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
        
        {editor.isActive('link') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={removeLink}
            className="text-xs text-destructive"
          >
            Remove Link
          </Button>
        )}
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setLink()}
            className="flex-1 px-2 py-1 text-sm bg-transparent border rounded focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <Button size="sm" onClick={setLink} disabled={!linkUrl.trim()}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowLinkDialog(false)}>
            Cancel
          </Button>
        </div>
      )}

      {/* Editor */}
      <div
        className={cn(
          'min-h-[300px] rounded-md border bg-background p-3',
          isOverLimit && 'border-destructive focus-within:ring-destructive',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onKeyDown={handleKeyDown}
      >
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none dark:prose-invert focus:outline-none [&_*]:focus:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:min-h-[250px] [&_.ProseMirror]:cursor-text"
        />
      </div>

      {/* Character Counter */}
      <div className="flex items-center justify-between">
        {isOverLimit ? (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Character limit exceeded. LinkedIn posts must be {LINKEDIN_LIMIT} characters or less.
            </AlertDescription>
          </Alert>
        ) : (
          <div />
        )}
        
        <div className={cn(
          'text-sm font-medium',
          isOverLimit && 'text-destructive',
          isNearLimit && !isOverLimit && 'text-amber-500'
        )}>
          {characterCount.toLocaleString()} / {LINKEDIN_LIMIT.toLocaleString()}
          {isNearLimit && !isOverLimit && ' (approaching limit)'}
        </div>
      </div>
    </div>
  );
}