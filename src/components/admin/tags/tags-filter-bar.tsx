'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TagsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  usageFilter: 'all' | 'used' | 'orphaned';
  onUsageFilterChange: (filter: 'all' | 'used' | 'orphaned') => void;
}

export function TagsFilterBar({
  searchQuery,
  onSearchChange,
  usageFilter,
  onUsageFilterChange,
}: TagsFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  // Sync local state with prop
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const hasFilters = searchQuery || usageFilter !== 'all';

  const clearFilters = () => {
    setLocalSearch('');
    onSearchChange('');
    onUsageFilterChange('all');
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tags..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Usage Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Show:</span>
        <div className="flex gap-1">
          <Button
            variant={usageFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUsageFilterChange('all')}
          >
            All
          </Button>
          <Button
            variant={usageFilter === 'used' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUsageFilterChange('used')}
          >
            In Use
          </Button>
          <Button
            variant={usageFilter === 'orphaned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onUsageFilterChange('orphaned')}
          >
            Orphaned
          </Button>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-2"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
