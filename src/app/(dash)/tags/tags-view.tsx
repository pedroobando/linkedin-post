'use client';

import React from 'react';
import {
  IconTag,
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconTagsOff,
  IconGlobe,
} from '@tabler/icons-react';

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
import { Skeleton } from '@/components/ui/skeleton';
import type { TagWithCount } from '@/actions/tags';

// ============== Types ==============

export interface TagsViewProps {
  // State
  tags: TagWithCount[];
  filteredTags: TagWithCount[];
  loading: boolean;
  searchQuery: string;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedTag: TagWithCount | null;
  tagName: string;
  isSubmitting: boolean;
  currentUserId?: string;

  // Setters
  onSearchQueryChange: (query: string) => void;
  onCreateDialogOpenChange: (open: boolean) => void;
  onEditDialogOpenChange: (open: boolean) => void;
  onDeleteDialogOpenChange: (open: boolean) => void;
  onTagNameChange: (name: string) => void;

  // Handlers
  onCreateTag: () => void;
  onUpdateTag: () => void;
  onDeleteTag: () => void;
  onEditTag: (tag: TagWithCount) => void;
  onDeleteTagClick: (tag: TagWithCount) => void;
  onCloseCreateDialog: () => void;
  onCloseEditDialog: () => void;
  onCloseDeleteDialog: () => void;

  // Utilities
  canModifyTag: (tag: TagWithCount) => boolean;
  getTagColor: (name: string) => string;
  formatDate: (dateString: string | Date) => string;
}

// ============== Component ==============

export function TagsView({
  // State
  tags,
  filteredTags,
  loading,
  searchQuery,
  isCreateDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  selectedTag,
  tagName,
  isSubmitting,
  currentUserId,

  // Setters
  onSearchQueryChange,
  onCreateDialogOpenChange,
  onEditDialogOpenChange,
  onDeleteDialogOpenChange,
  onTagNameChange,

  // Handlers
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onEditTag,
  onDeleteTagClick,
  onCloseCreateDialog,
  onCloseEditDialog,
  onCloseDeleteDialog,

  // Utilities
  canModifyTag,
  getTagColor,
  formatDate,
}: TagsViewProps) {
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
            {currentUserId && (
              <Dialog open={isCreateDialogOpen} onOpenChange={onCreateDialogOpenChange}>
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
                        onChange={(e) => onTagNameChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onCreateTag();
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={onCloseCreateDialog}>
                      Cancel
                    </Button>
                    <Button onClick={onCreateTag} disabled={isSubmitting}>
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
            )}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
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
                {currentUserId && (
                  <Button onClick={() => onCreateDialogOpenChange(true)}>
                    <IconPlus className="size-4 mr-2" />
                    Create Your First Tag
                  </Button>
                )}
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
                <Button variant="outline" onClick={() => onSearchQueryChange('')}>
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
                    {filteredTags.map((tag) => {
                      const isGlobal = tag.userId === null;
                      const canEdit = canModifyTag(tag);

                      return (
                        <TableRow key={tag.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${getTagColor(tag.name)} border`}>
                                <IconTag className="size-3 mr-1" />
                                {tag.name}
                              </Badge>
                              {isGlobal && (
                                <Badge variant="secondary" className="text-xs">
                                  <IconGlobe className="size-3 mr-1" />
                                  Global
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{tag.slug}</TableCell>
                          <TableCell className="text-right">
                            <span className="text-sm font-medium">{tag.count}</span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">{formatDate(tag.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            {canEdit && (
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => onEditTag(tag)}
                                  title="Edit tag"
                                >
                                  <IconEdit className="size-3.5" />
                                  <span className="sr-only">Edit {tag.name}</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  onClick={() => onDeleteTagClick(tag)}
                                  title="Delete tag"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <IconTrash className="size-3.5" />
                                  <span className="sr-only">Delete {tag.name}</span>
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={onEditDialogOpenChange}>
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
                onChange={(e) => onTagNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onUpdateTag();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseEditDialog}>
              Cancel
            </Button>
            <Button onClick={onUpdateTag} disabled={isSubmitting}>
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tag</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the tag &quot;{selectedTag?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseDeleteDialog}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeleteTag} disabled={isSubmitting}>
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
