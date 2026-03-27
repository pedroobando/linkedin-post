'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { getAllTagsWithCount, upsertTag, updateTag, deleteTag, canDeleteTag, type TagWithCount } from '@/actions/tags';

// ============== Types ==============

export interface UseTagsOptions {
  initialTags: TagWithCount[];
  currentUserId?: string;
}

export interface UseTagsReturn {
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

  // Setters
  setSearchQuery: (query: string) => void;
  setIsCreateDialogOpen: (open: boolean) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setTagName: (name: string) => void;

  // Handlers
  loadTags: () => Promise<void>;
  handleCreateTag: () => Promise<void>;
  handleUpdateTag: () => Promise<void>;
  handleDeleteTag: () => Promise<void>;
  openEditDialog: (tag: TagWithCount) => void;
  openDeleteDialog: (tag: TagWithCount) => void;
  closeCreateDialog: () => void;
  closeEditDialog: () => void;
  closeDeleteDialog: () => void;

  // Utilities
  canModifyTag: (tag: TagWithCount) => boolean;
  getTagColor: (name: string) => string;
  formatDate: (dateString: string | Date) => string;
}

// ============== Utilities ==============

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

// ============== Hook ==============

export function useTags({ initialTags, currentUserId }: UseTagsOptions): UseTagsReturn {
  const [tags, setTags] = useState<TagWithCount[]>(initialTags);
  const [filteredTags, setFilteredTags] = useState<TagWithCount[]>(initialTags);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagWithCount | null>(null);
  const [tagName, setTagName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Check if user can modify a tag
  const canModifyTag = useCallback(
    (tag: TagWithCount): boolean => {
      if (!currentUserId) return false; // Must be authenticated
      if (tag.userId === null) return false; // Global tags editable by all
      return tag.userId === currentUserId; // Own tags only
    },
    [currentUserId],
  );

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

    // Validate userId before calling server action
    if (!currentUserId) {
      toast.error('Authentication required');
      return;
    }

    try {
      setIsSubmitting(true);
      await upsertTag(tagName.trim(), currentUserId);
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

    // Validate userId before calling server action
    if (!currentUserId) {
      toast.error('Authentication required');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('update');
      await updateTag(selectedTag.id, tagName.trim(), currentUserId);
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

    // Validate userId before calling server action
    if (!currentUserId) {
      toast.error('Authentication required');
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteTag(selectedTag.id, currentUserId);
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

  const closeCreateDialog = () => {
    setTagName('');
    setIsCreateDialogOpen(false);
  };

  const closeEditDialog = () => {
    setTagName('');
    setSelectedTag(null);
    setIsEditDialogOpen(false);
  };

  const closeDeleteDialog = () => {
    setSelectedTag(null);
    setIsDeleteDialogOpen(false);
  };

  return {
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

    // Setters
    setSearchQuery,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setTagName,

    // Handlers
    loadTags,
    handleCreateTag,
    handleUpdateTag,
    handleDeleteTag,
    openEditDialog,
    openDeleteDialog,
    closeCreateDialog,
    closeEditDialog,
    closeDeleteDialog,

    // Utilities
    canModifyTag,
    getTagColor,
    formatDate,
  };
}
