'use client';

import { forwardRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { useInputTagGroup } from './use-input-tag-group';

interface InputTagGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export const InputTagGroup = forwardRef<HTMLInputElement, InputTagGroupProps>(
  ({ id, tags, onTagsChange, placeholder = 'Type and press Enter...', className, maxTags, ...props }, ref) => {
    const { inputValue, setInputValue, removeTag, handleKeyDown } = useInputTagGroup({ onTagsChange, tags, maxTags });

    return (
      <InputGroup className={cn('w-full', className)}>
        {tags.length >= 1 && (
          <InputGroupAddon align="block-start" className="flex flex-wrap gap-2 pb-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="gap-1 pr-1.5 text-sm">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 rounded-sm hover:bg-muted"
                  aria-label={`Remove ${tag}`}
                >
                  <XIcon className="h-3 w-3" />
                  <span className="sr-only">Remove {tag}</span>
                </button>
              </Badge>
            ))}
          </InputGroupAddon>
        )}
        <InputGroupInput
          id={id}
          ref={ref}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="h-7 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={maxTags ? tags.length >= maxTags : false}
          {...props}
        />
      </InputGroup>
    );
  },
);

InputTagGroup.displayName = 'InputTagGroup';
