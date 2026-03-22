/**
 * Tag utility functions - pure functions (no database operations).
 * These helper functions can be used on both client and server.
 * 
 * NOTE: This file does NOT use 'use server' so it can be imported by Client Components.
 */

/** Maximum length for a tag name */
export const MAX_TAG_LENGTH = 50;

/** Maximum number of tags per article */
export const MAX_TAGS_PER_ARTICLE = 10;

/**
 * Convert a tag name to a URL-friendly slug.
 * - Converts to lowercase
 * - Removes special characters
 * - Replaces spaces with hyphens
 * - Collapses multiple hyphens
 * - Trims leading/trailing hyphens
 * 
 * @param name - The tag name to slugify
 * @returns The slugified tag name
 * 
 * @example
 * slugify("Artificial Intelligence") // "artificial-intelligence"
 * slugify("AI & Machine Learning!") // "ai-machine-learning"
 * slugify("  Multiple   Spaces  ") // "multiple-spaces"
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove accents and diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Collapse multiple hyphens
    .replace(/-+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Limit length
    .slice(0, MAX_TAG_LENGTH);
}

/**
 * Validate a tag name and return detailed validation result.
 * 
 * @param name - The tag name to validate
 * @returns Object with isValid and error message
 */
export function validateTagName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Tag name cannot be empty' };
  }
  
  if (trimmed.length > MAX_TAG_LENGTH) {
    return { isValid: false, error: `Tag name cannot exceed ${MAX_TAG_LENGTH} characters` };
  }
  
  const slug = slugify(trimmed);
  if (!slug) {
    return { isValid: false, error: 'Tag name must contain valid characters' };
  }
  
  return { isValid: true };
}

/**
 * Format a tag name for display (capitalize first letter of each word).
 * 
 * @param name - The tag name to format
 * @returns Formatted tag name
 * 
 * @example
 * formatTagName("artificial intelligence") // "Artificial Intelligence"
 */
export function formatTagName(name: string): string {
  return name
    .trim()
    .split(/[-\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if a tag name is valid (boolean check).
 * 
 * @param name - The tag name to check
 * @returns Boolean indicating if the tag name is valid
 */
export function isValidTagName(name: string): boolean {
  return validateTagName(name).isValid;
}
