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
import { useState } from 'react';

interface DeleteTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: TagWithCount | null;
  onConfirm: () => Promise<void>;
}

export function DeleteTagDialog({
  open,
  onOpenChange,
  tag,
  onConfirm,
}: DeleteTagDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  if (!tag) return null;

  const isBlocked = tag.count > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBlocked ? (
              <>
                <AlertTriangle className="h-5 w-5 text-warning" />
                Cannot Delete Tag
              </>
            ) : (
              'Delete Tag'
            )}
          </DialogTitle>
          <DialogDescription>
            {isBlocked ? (
              <>
                The tag <strong>&quot;{tag.name}&quot;</strong> is currently used in{' '}
                <strong>{tag.count}</strong> article{tag.count === 1 ? '' : 's'}.
                <br /><br />
                You must remove this tag from all articles before it can be deleted.
              </>
            ) : (
              <>
                Are you sure you want to delete the tag{' '}
                <strong>&quot;{tag.name}&quot;</strong>?
                <br /><br />
                This action cannot be undone.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {isBlocked ? 'Close' : 'Cancel'}
          </Button>
          {!isBlocked && (
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
