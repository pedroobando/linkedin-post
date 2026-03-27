'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { IconTag, IconPlus, IconSearch, IconEdit, IconTrash, IconLoader2, IconTagsOff } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  getAllTagsWithCount,
  upsertTag,
  updateTag,
  deleteTag,
  searchTags,
  canDeleteTag,
  type TagWithCount,
} from '@/actions/tags';
import { Skeleton } from '@/components/ui/skeleton';

// Tag color generator - consistent colors based on tag name
function getTagColor(name: string): string {
  const colors = [
    'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'bg-green-500/10 text-green-600 border-green-500/20',
    'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'bg-pink-500/10 text-pink-600 border-pink-500/20',
    'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'bg-rose-500/10 text-rose-600 border-rose-500/20',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Format date
function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [filteredTags, setFilteredTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagWithCount | null>(null);
  const [tagName, setTagName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tags on mount
  useEffect(() => {
    loadTags();
  }, []);

  // Filter tags when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTags(tags);
    } else {
      const filtered = tags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tag.slug.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredTags(filtered);
    }
  }, [searchQuery, tags]);

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTagsWithCount();
      setTags(data);
      setFilteredTags(data);
    } catch (error) {
      toast.error('Failed to load tags', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateTag = async () => {
    if (!tagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await upsertTag(tagName.trim());
      toast.success('Tag created successfully');
      setTagName('');
      setIsCreateDialogOpen(false);
      await loadTags();
    } catch (error) {
      toast.error('Failed to create tag', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!selectedTag || !tagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateTag(selectedTag.id, tagName.trim());
      toast.success('Tag updated successfully');
      setTagName('');
      setSelectedTag(null);
      setIsEditDialogOpen(false);
      await loadTags();
    } catch (error) {
      toast.error('Failed to update tag', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    try {
      setIsSubmitting(true);
      await deleteTag(selectedTag.id);
      toast.success('Tag deleted successfully');
      setSelectedTag(null);
      setIsDeleteDialogOpen(false);
      await loadTags();
    } catch (error) {
      toast.error('Failed to delete tag', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (tag: TagWithCount) => {
    setSelectedTag(tag);
    setTagName(tag.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = async (tag: TagWithCount) => {
    const canDelete = await canDeleteTag(tag.id);
    if (!canDelete) {
      toast.error('Cannot delete tag', {
        description: 'This tag is being used by articles. Remove it from all articles first.',
      });
      return;
    }
    setSelectedTag(tag);
    setIsDeleteDialogOpen(true);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 px-4 md:py-6 md:px-6">
            {/* Header Skeleton */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>

            {/* Search Skeleton */}
            <Skeleton className="h-10 w-full max-w-sm" />

            {/* Table Skeleton */}
            <Card>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 px-4 md:py-6 md:px-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage tags to organize and categorize your LinkedIn articles
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <IconPlus className="size-4 mr-2" />
                  New Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                  <DialogDescription>Add a new tag to organize your articles</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Tag Name
                    </label>
                    <Input
                      id="name"
                      placeholder="e.g., AI, Leadership, Marketing"
                      value={tagName}
                      onChange={(e) => setTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateTag();
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTagName('');
                      setIsCreateDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTag} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <IconLoader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <IconPlus className="size-4 mr-2" />
                    )}
                    Create Tag
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tags Table or Empty State */}
          {tags.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-muted p-4">
                  <IconTagsOff className="size-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">No tags yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Tags help you organize and categorize your articles. Create your first tag to get started.
                  </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <IconPlus className="size-4 mr-2" />
                  Create Your First Tag
                </Button>
              </div>
            </Card>
          ) : filteredTags.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-muted p-4">
                  <IconSearch className="size-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">No tags found</h3>
                  <p className="text-sm text-muted-foreground">
                    No tags match your search for &quot;{searchQuery}&quot;
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-base">All Tags</CardTitle>
                <CardDescription>
                  {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="text-right">Articles</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTags.map((tag) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <Badge variant="outline" className={`${getTagColor(tag.name)} border`}>
                            <IconTag className="size-3 mr-1" />
                            {tag.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{tag.slug}</TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-medium">{tag.count}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{formatDate(tag.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-xs" onClick={() => openEditDialog(tag)} title="Edit tag">
                              <IconEdit className="size-3.5" />
                              <span className="sr-only">Edit {tag.name}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => openDeleteDialog(tag)}
                              title="Delete tag"
                              className="text-destructive hover:text-destructive"
                            >
                              <IconTrash className="size-3.5" />
                              <span className="sr-only">Delete {tag.name}</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>Update the tag name</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                Tag Name
              </label>
              <Input
                id="edit-name"
                placeholder="Tag name"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateTag();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTagName('');
                setSelectedTag(null);
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateTag} disabled={isSubmitting}>
              {isSubmitting ? (
                <IconLoader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <IconEdit className="size-4 mr-2" />
              )}
              Update Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tag &quot;{selectedTag?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTag(null);
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTag} disabled={isSubmitting}>
              {isSubmitting ? (
                <IconLoader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <IconTrash className="size-4 mr-2" />
              )}
              Delete Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
