'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Search, Tag } from 'lucide-react';
import { getAllTagsWithCount } from '@/actions/tags';
import { Tag as TagType } from '@/db/schema';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

export function ArticleFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.getAll('tags')
  );
  const [availableTags, setAvailableTags] = useState<(TagType & { count: number })[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  // Load available tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getAllTagsWithCount();
        setAvailableTags(tags);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    loadTags();
  }, []);

  // Update URL when filters change (debounced for search)
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateUrl();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  // Update URL immediately for non-search filters
  useEffect(() => {
    if (status !== searchParams.get('status') || 
        JSON.stringify(selectedTags) !== JSON.stringify(searchParams.getAll('tags'))) {
      updateUrl();
    }
  }, [status, selectedTags]);

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);
    selectedTags.forEach((tag) => params.append('tags', tag));
    
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ''}`);
  }, [search, status, selectedTags, pathname, router]);

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setSelectedTags([]);
    router.push(pathname);
  };

  const handleTagSelect = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags([...selectedTags, tagName]);
    }
    setTagPopoverOpen(false);
  };

  const handleTagRemove = (tagName: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagName));
  };

  const hasFilters = search || status !== 'all' || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Status Filter */}
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Tag Filter */}
        <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Tag className="h-4 w-4" />
              Tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {availableTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleTagSelect(tag.name)}
                    disabled={selectedTags.includes(tag.name)}
                  >
                    <span>{tag.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      ({tag.count})
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasFilters && (
          <Button variant="ghost" onClick={handleClearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Selected Tags Chips */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtered by:</span>
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
