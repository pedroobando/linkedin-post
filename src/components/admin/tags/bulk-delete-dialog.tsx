'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TagWithCount } from './tags-list';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';

interface BulkDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: TagWithCount[];
  onConfirm: () => Promise<void>;
}

export function BulkDeleteDialog({
  open,
  onOpenChange,
  tags,
  onConfirm,
}: BulkDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  // Calculate deletable vs blocked
  const { deletable, blocked } = useMemo(() => {
    const deletable = tags.filter((t) => t.count === 0);
    const blocked = tags.filter((t) => t.count > 0);
    return { deletable, blocked };
  }, [tags]);

  if (tags.length === 0) return null;

  const canDeleteAny = deletable.length > 0;
  const allBlocked = blocked.length === tags.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {allBlocked ? (
              <>
                <AlertTriangle className="h-5 w-5 text-warning" />
                Cannot Delete Tags
              </>
            ) : (
              'Delete Selected Tags'
            )}
          </DialogTitle>
          <DialogDescription>
            {allBlocked ? (
              <>
                All <strong>{tags.length}</strong> selected tag{tags.length === 1 ? '' : 's'} are currently
                in use and cannot be deleted.
              </>
            ) : (
              <>
                You are about to delete <strong>{deletable.length}</strong> tag
                {deletable.length === 1 ? '' : 's'}.
                {blocked.length > 0 && (
                  <>
                    {' '}
                    <strong>{blocked.length}</strong> tag
                    {blocked.length === 1 ? '' : 's'} cannot be deleted because
                    {blocked.length === 1 ? ' it is' : ' they are'} in use.
                  </>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Show tags that will be deleted */}
        {deletable.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Tags to delete:</p>
            <div className="max-h-32 overflow-y-auto rounded-md border p-2">
              <ul className="text-sm space-y-1">
                {deletable.map((tag) => (
                  <li key={tag.id} className="text-destructive">
                    • {tag.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Show blocked tags */}
        {blocked.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Tags that will be skipped (in use):
            </p>
            <div className="max-h-32 overflow-y-auto rounded-md border p-2 bg-muted/50">
              <ul className="text-sm space-y-1">
                {blocked.map((tag) => (
                  <li key={tag.id} className="text-muted-foreground">
                    • {tag.name} ({tag.count} article{tag.count === 1 ? '' : 's'})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          {canDeleteAny && (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting
                ? 'Deleting...'
                : `Delete ${deletable.length} Tag${deletable.length === 1 ? '' : 's'}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
