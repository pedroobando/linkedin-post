/**
 * Tag Utilities
 * Shared constants and helper functions for tag operations.
 */

import { Tag } from '@/db/schema';

/**
 * Maximum number of tags allowed per article
 */
export const MAX_TAGS_PER_ARTICLE = 10;

/**
 * Maximum length for a tag name
 */
export const MAX_TAG_LENGTH = 50;

/**
 * Tag with ownership information
 */
export interface TagWithOwnership extends Tag {
  isGlobal: boolean;
  isOwn: boolean;
  canModify: boolean;
}

/**
 * Convert a string to a URL-friendly slug.
 * @param text - The text to convert
 * @returns The slugified text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Check if a tag can be modified by the current user.
 * 
 * Global tags (userId = null) can be modified by any authenticated user.
 * Personal tags can only be modified by their owner.
 * 
 * @param tag - The tag to check
 * @param currentUserId - The current user's ID (undefined if not authenticated)
 * @returns Boolean indicating if the user can modify the tag
 */
export const canModifyTag = (
  tag: Tag,
  currentUserId: string | undefined
): boolean => {
  if (!currentUserId) return false;  // Must be authenticated
  if (tag.userId === null) return true;  // Global tags editable by all authenticated users
  return tag.userId === currentUserId;  // Own tags only
};
