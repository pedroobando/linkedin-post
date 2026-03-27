'use client';

import React from 'react';
import { useTags, type UseTagsOptions } from './use-tags';
import { TagsView } from './tags-view';

// ============== Types ==============

export type TagsContainerProps = UseTagsOptions;

// ============== Component ==============

export function TagsContainer({ initialTags, currentUserId }: TagsContainerProps) {
  const {
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
  } = useTags({ initialTags, currentUserId });

  return (
    <TagsView
      // State
      tags={tags}
      filteredTags={filteredTags}
      loading={loading}
      searchQuery={searchQuery}
      isCreateDialogOpen={isCreateDialogOpen}
      isEditDialogOpen={isEditDialogOpen}
      isDeleteDialogOpen={isDeleteDialogOpen}
      selectedTag={selectedTag}
      tagName={tagName}
      isSubmitting={isSubmitting}
      currentUserId={currentUserId}
      // Setters
      onSearchQueryChange={setSearchQuery}
      onCreateDialogOpenChange={setIsCreateDialogOpen}
      onEditDialogOpenChange={setIsEditDialogOpen}
      onDeleteDialogOpenChange={setIsDeleteDialogOpen}
      onTagNameChange={setTagName}
      // Handlers
      onCreateTag={handleCreateTag}
      onUpdateTag={handleUpdateTag}
      onDeleteTag={handleDeleteTag}
      onEditTag={openEditDialog}
      onDeleteTagClick={openDeleteDialog}
      onCloseCreateDialog={closeCreateDialog}
      onCloseEditDialog={closeEditDialog}
      onCloseDeleteDialog={closeDeleteDialog}
      // Utilities
      canModifyTag={canModifyTag}
      getTagColor={getTagColor}
      formatDate={formatDate}
    />
  );
}
