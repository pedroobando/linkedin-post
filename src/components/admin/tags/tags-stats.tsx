'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getTagStats, deleteOrphanedTags } from '@/actions/tags';
import { Tag, CheckCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface TagStats {
  total: number;
  inUse: number;
  orphaned: number;
}

export function TagsStats() {
  const [stats, setStats] = useState<TagStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await getTagStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load tag statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCleanup = async () => {
    setIsCleaning(true);
    try {
      const count = await deleteOrphanedTags();
      if (count > 0) {
        toast.success(`${count} orphaned tag${count === 1 ? '' : 's'} removed`);
        await loadStats();
      } else {
        toast.info('No orphaned tags to clean up');
      }
    } catch (error) {
      toast.error('Failed to clean up orphaned tags');
    } finally {
      setIsCleaning(false);
      setCleanupDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse h-16 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse h-16 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse h-16 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Tags */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Tags
                </p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Tag className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags In Use */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Use
                </p>
                <p className="text-3xl font-bold text-green-600">{stats.inUse}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orphaned Tags */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Orphaned
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.orphaned}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            {stats.orphaned > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => setCleanupDialogOpen(true)}
                disabled={isCleaning}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Up
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cleanup Confirmation Dialog */}
      <Dialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Clean Up Orphaned Tags</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{stats.orphaned}</strong> unused
              tag{stats.orphaned === 1 ? '' : 's'} that are not associated with any
              articles.
              <br /><br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCleanupDialogOpen(false)}
              disabled={isCleaning}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCleanup}
              disabled={isCleaning}
            >
              {isCleaning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCleaning ? 'Cleaning...' : 'Clean Up'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
