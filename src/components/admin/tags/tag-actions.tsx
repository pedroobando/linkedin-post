'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { TagWithCount } from './tags-list';

interface TagActionsProps {
  tag: TagWithCount;
}

export function TagActions({ tag }: TagActionsProps) {
  // Get the TagsList component's handlers via custom event
  const handleEdit = () => {
    window.dispatchEvent(
      new CustomEvent('editTag', { detail: tag })
    );
  };

  const handleDelete = () => {
    window.dispatchEvent(
      new CustomEvent('deleteTag', { detail: tag })
    );
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleEdit}
        className="h-8 w-8"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={tag.count > 0}
        className="h-8 w-8"
        title={tag.count > 0 ? 'Cannot delete tag in use' : 'Delete tag'}
      >
        <Trash2 className={`h-4 w-4 ${tag.count > 0 ? 'text-muted-foreground' : 'text-destructive'}`} />
      </Button>
    </div>
  );
}
