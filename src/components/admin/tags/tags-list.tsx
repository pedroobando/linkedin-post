'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Tag } from '@/db/schema';
import { getAllTagsWithCount, deleteTag, deleteTags } from '@/actions/tags';
import { DataTable } from '@/components/data-table/data-table';
import { TagsFilterBar } from './tags-filter-bar';
import { TagFormDialog } from './tag-form-dialog';
import { DeleteTagDialog } from './delete-tag-dialog';
import { BulkDeleteDialog } from './bulk-delete-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export type TagWithCount = Tag & { count: number };

export function TagsList() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [filteredTags, setFilteredTags] = useState<TagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<TagWithCount[]>([]);
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [tagToEdit, setTagToEdit] = useState<TagWithCount | null>(null);
  const [tagToDelete, setTagToDelete] = useState<TagWithCount | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [usageFilter, setUsageFilter] = useState<'all' | 'used' | 'orphaned'>('all');

  // Load tags
  const loadTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllTagsWithCount();
      setTags(data);
    } catch (error) {
      toast.error('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Apply filters
  useEffect(() => {
    let filtered = tags;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tag) =>
          tag.name.toLowerCase().includes(query) ||
          tag.slug.toLowerCase().includes(query)
      );
    }

    // Usage filter
    if (usageFilter === 'used') {
      filtered = filtered.filter((tag) => tag.count > 0);
    } else if (usageFilter === 'orphaned') {
      filtered = filtered.filter((tag) => tag.count === 0);
    }

    setFilteredTags(filtered);
  }, [tags, searchQuery, usageFilter]);

  // Handle edit
  const handleEdit = useCallback((tag: TagWithCount) => {
    setTagToEdit(tag);
    setEditDialogOpen(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback((tag: TagWithCount) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  }, []);

  // Handle single delete confirm
  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    try {
      await deleteTag(tagToDelete.id);
      toast.success(`Tag "${tagToDelete.name}" deleted successfully`);
      await loadTags();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete tag';
      toast.error(message);
    } finally {
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  // Handle bulk delete confirm
  const handleBulkDeleteConfirm = async () => {
    if (selectedRows.length === 0) return;

    try {
      const result = await deleteTags(selectedRows.map((t) => t.id));
      
      if (result.deleted > 0) {
        toast.success(`${result.deleted} tag${result.deleted === 1 ? '' : 's'} deleted successfully`);
      }
      
      if (result.blocked.length > 0) {
        toast.warning(`${result.blocked.length} tag${result.blocked.length === 1 ? '' : 's'} could not be deleted (in use)`);
      }
      
      await loadTags();
      setSelectedRows([]);
    } catch (error) {
      toast.error('Failed to delete tags');
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  // Handle success after create/edit
  const handleFormSuccess = async () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setTagToEdit(null);
    await loadTags();
  };

  // Define columns with access to handlers
  const columns: ColumnDef<TagWithCount>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            aria-label="Select all"
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
            aria-label="Select row"
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="font-medium max-w-[200px] truncate">
            {row.getValue('name')}
          </div>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <code className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
            {row.getValue('slug')}
          </code>
        ),
      },
      {
        accessorKey: 'count',
        header: 'Articles',
        cell: ({ row }) => {
          const count = row.getValue('count') as number;
          return (
            <Badge variant={count > 0 ? 'default' : 'secondary'} className="text-xs">
              {count}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => {
          const date = row.getValue('createdAt') as Date;
          return (
            <div className="text-muted-foreground text-sm">
              {format(new Date(date), 'MMM d, yyyy')}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const tag = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(tag)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(tag)}
                disabled={tag.count > 0}
                className="h-8 w-8"
                title={tag.count > 0 ? 'Cannot delete tag in use' : 'Delete tag'}
              >
                <Trash2 className={`h-4 w-4 ${tag.count > 0 ? 'text-muted-foreground' : 'text-destructive'}`} />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [handleEdit, handleDelete]
  );

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <TagsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        usageFilter={usageFilter}
        onUsageFilterChange={setUsageFilter}
      />

      {/* Bulk Actions Toolbar */}
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            className="ml-auto"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
        </div>
      )}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredTags}
        onNewPlace={() => setCreateDialogOpen(true)}
        newTitle="New Tag"
        newButtonAllow={true}
      />

      {/* Create Dialog */}
      <TagFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        onSuccess={handleFormSuccess}
      />

      {/* Edit Dialog */}
      <TagFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        mode="edit"
        tag={tagToEdit || undefined}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Dialog */}
      <DeleteTagDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tag={tagToDelete}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        tags={selectedRows}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  );
}
