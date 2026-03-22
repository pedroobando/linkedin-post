'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInputTag } from './use-input-tag';

//

interface InputTagProps {
  id: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

// tags,
//   onTagsChange,
//   placeholder = 'Escribe y presiona Enter...',
//   className,
//   maxTags,
//   ...props
// }: InputTagProps

export function InputTag({
  id,
  tags,
  onTagsChange,
  placeholder = 'Escribe y presiona Enter...',
  className,
  maxTags,
}: InputTagProps) {
  const { inputValue, setInputValue, removeTag, handleKeyDown } = useInputTag({ onTagsChange, tags, maxTags });

  return (
    <div
      className={cn(
        'flex min-h-10 w-full flex-wrap gap-2 rounded-lg border border-input bg-background px-3 py-2 text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className,
      )}
    >
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="gap-1 pr-1.5 text-sm">
          {tag}
          <button type="button" onClick={() => removeTag(index)} className="ml-1 rounded-sm hover:bg-muted">
            <XIcon className="h-3 w-3" />
            <span className="sr-only">Eliminar {tag}</span>
          </button>
        </Badge>
      ))}
      <Input
        id={id}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="h-7 flex-1 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={maxTags ? tags.length >= maxTags : false}
      />
    </div>
  );
}
