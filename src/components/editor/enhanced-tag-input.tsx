'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { XIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchTags } from '@/actions/tags';
import { Tag } from '@/db/schema';
import { MAX_TAGS_PER_ARTICLE, MAX_TAG_LENGTH, slugify } from '@/actions/tags/utils';

interface EnhancedTagInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Enhanced Tag Input with Autocomplete
 * 
 * Features:
 * - Autocomplete from existing tags in database
 * - Tag limit validation (max 10)
 * - Tag normalization (lowercase, kebab-case, max 50 chars)
 * - Duplicate detection
 * - Keyboard navigation
 */
export function EnhancedTagInput({
  id,
  tags,
  onTagsChange,
  placeholder = 'Type and press Enter...',
  className,
  disabled = false,
  ...props
}: EnhancedTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions when input changes
  useEffect(() => {
    if (!inputValue.trim() || inputValue.length < 1) {
      setSuggestions([]);
      return;
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchTags(inputValue, 5);
        // Filter out already selected tags
        const filtered = results.filter(
          (tag) => !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
        );
        setSuggestions(filtered);
      } catch {
        setSuggestions([]);
      }
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, tags]);

  const validateAndNormalizeTag = useCallback((rawTag: string): { valid: boolean; tag?: string; error?: string } => {
    const trimmed = rawTag.trim();
    
    if (!trimmed) {
      return { valid: false, error: 'Tag cannot be empty' };
    }

    // Check length
    if (trimmed.length > MAX_TAG_LENGTH) {
      return { valid: false, error: `Tag cannot exceed ${MAX_TAG_LENGTH} characters` };
    }

    // Normalize
    const normalized = trimmed.toLowerCase().trim();
    const slug = slugify(normalized);

    if (!slug) {
      return { valid: false, error: 'Tag must contain valid characters' };
    }

    // Check if already exists
    if (tags.some((t) => t.toLowerCase() === normalized.toLowerCase())) {
      return { valid: false, error: 'Tag already added' };
    }

    // Check limit
    if (tags.length >= MAX_TAGS_PER_ARTICLE) {
      return { valid: false, error: `Maximum ${MAX_TAGS_PER_ARTICLE} tags allowed` };
    }

    return { valid: true, tag: normalized };
  }, [tags]);

  const addTag = useCallback((rawTag: string) => {
    const result = validateAndNormalizeTag(rawTag);
    
    if (!result.valid) {
      setError(result.error || 'Invalid tag');
      setTimeout(() => setError(null), 3000);
      return false;
    }

    onTagsChange([...tags, result.tag!]);
    setInputValue('');
    setSuggestions([]);
    setError(null);
    return true;
  }, [tags, onTagsChange, validateAndNormalizeTag]);

  const removeTag = useCallback((indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
    setError(null);
  }, [tags, onTagsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Limit reached - block all keys except backspace/navigation
    if (tags.length >= MAX_TAGS_PER_ARTICLE) {
      if (e.key === 'Backspace' && !inputValue) {
        removeTag(tags.length - 1);
      }
      return;
    }

    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }, [inputValue, tags.length, addTag, removeTag]);

  const handleSelectSuggestion = useCallback((tagName: string) => {
    addTag(tagName);
    setIsOpen(false);
    inputRef.current?.focus();
  }, [addTag]);

  const isAtLimit = tags.length >= MAX_TAGS_PER_ARTICLE;

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={isOpen && suggestions.length > 0 && !isAtLimit} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <InputGroup className="w-full">
            {tags.length >= 1 && (
              <InputGroupAddon align="block-start" className="flex flex-wrap gap-2 pb-2">
                {tags.map((tag, index) => (
                  <Badge 
                    key={`${tag}-${index}`} 
                    variant="secondary" 
                    className="gap-1 pr-1.5 text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 rounded-sm hover:bg-muted"
                      aria-label={`Remove ${tag}`}
                      disabled={disabled}
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
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAtLimit ? 'Maximum tags reached' : (tags.length === 0 ? placeholder : '')}
              className="h-7 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={disabled || isAtLimit}
              {...props}
            />
          </InputGroup>
        </PopoverTrigger>
        
        <PopoverContent className="p-0 w-[300px]" align="start">
          <Command>
            <CommandInput 
              placeholder="Search tags..." 
              value={inputValue}
              onValueChange={setInputValue}
            />
            <CommandList>
              <CommandEmpty>
                {inputValue.trim() ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Press Enter to create &quot;{inputValue.trim()}&quot;
                  </div>
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    Type to search or create tags
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup heading="Existing Tags">
                {suggestions.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleSelectSuggestion(tag.name)}
                    className="cursor-pointer"
                  >
                    <span className="flex-1">{tag.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {tag.slug}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Tag Count */}
      <div className={cn(
        'text-xs text-muted-foreground',
        isAtLimit && 'text-amber-500 font-medium'
      )}>
        {tags.length} / {MAX_TAGS_PER_ARTICLE} tags
        {isAtLimit && ' (maximum reached)'}
      </div>
    </div>
  );
}