'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

// LinkedIn character limit
const LINKEDIN_LIMIT = 3000;
const WARNING_THRESHOLD = 2800;

interface SimpleTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Simple Text Editor (TextArea)
 * 
 * Plain text editor without rich formatting.
 * Supports LinkedIn's 3000 character limit.
 * 
 * Character limit: 3000 (LinkedIn limit)
 * Warning at: 2800 characters
 */
export function SimpleTextEditor({
  content,
  onChange,
  placeholder = 'Write your article content...',
  className,
  disabled = false,
}: SimpleTextEditorProps) {
  const [characterCount, setCharacterCount] = useState(0);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [isNearLimit, setIsNearLimit] = useState(false);

  // Update character count when content changes
  useEffect(() => {
    const count = content.length;
    setCharacterCount(count);
    setIsOverLimit(count > LINKEDIN_LIMIT);
    setIsNearLimit(count >= WARNING_THRESHOLD && count <= LINKEDIN_LIMIT);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Only allow input if under limit
    if (value.length <= LINKEDIN_LIMIT) {
      onChange(value);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Editor */}
      <textarea
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'min-h-[300px] w-full rounded-md border bg-background p-3 resize-y',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'placeholder:text-muted-foreground',
          isOverLimit && 'border-destructive focus:ring-destructive',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      />

      {/* Character Counter */}
      <div className="flex items-center justify-end">
        <div className={cn(
          'text-sm font-medium',
          isOverLimit && 'text-destructive',
          isNearLimit && !isOverLimit && 'text-amber-500'
        )}>
          {characterCount.toLocaleString()} / {LINKEDIN_LIMIT.toLocaleString()}
          {isNearLimit && !isOverLimit && ' (approaching limit)'}
        </div>
      </div>

      {isOverLimit && (
        <p className="text-sm text-destructive">
          Character limit exceeded. LinkedIn posts must be {LINKEDIN_LIMIT} characters or less.
        </p>
      )}
    </div>
  );
}
