/**
 * Tag Utilities
 * Shared constants and helper functions for tag operations.
 */

/**
 * Maximum number of tags allowed per article
 */
export const MAX_TAGS_PER_ARTICLE = 10;

/**
 * Maximum length for a tag name
 */
export const MAX_TAG_LENGTH = 50;

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
