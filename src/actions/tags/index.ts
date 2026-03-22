/**
 * Tag Server Actions for managing article tags in the database.
 * Provides functions for tag CRUD and article-tag associations.
 */

'use server';

import { db } from '@/db';
import { tags, articleTags, Tag, NewTag } from '@/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';

// Import utility functions from utils.ts (not a 'use server' file)
import {
  slugify,
  MAX_TAG_LENGTH,
  MAX_TAGS_PER_ARTICLE,
} from './utils';

/**
 * Find an existing tag by name (case-insensitive) or create a new one.
 * Uses the slug for deduplication since slugs are unique.
 * 
 * @param name - The tag name to upsert
 * @returns The existing or newly created tag
 */
export async function upsertTag(name: string): Promise<Tag> {
  const slug = slugify(name);
  
  if (!slug) {
    throw new Error('Tag name cannot be empty after slugification');
  }

  // Try to find existing tag by slug (case-insensitive match)
  const existingTag = await db.query.tags.findFirst({
    where: eq(tags.slug, slug),
  });

  if (existingTag) {
    return existingTag;
  }

  // Create new tag
  const [newTag] = await db
    .insert(tags)
    .values({
      name: name.trim().slice(0, MAX_TAG_LENGTH),
      slug,
    })
    .returning();

  return newTag;
}

/**
 * Get all tags associated with an article.
 * 
 * @param articleId - The article ID
 * @returns Array of tag names as strings
 */
export async function getArticleTags(articleId: string): Promise<string[]> {
  const result = await db
    .select({
      name: tags.name,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, articleId));

  return result.map((r) => r.name);
}

/**
 * Get full tag objects associated with an article.
 * 
 * @param articleId - The article ID
 * @returns Array of Tag objects
 */
export async function getArticleTagObjects(articleId: string): Promise<Tag[]> {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      createdAt: tags.createdAt,
    })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, articleId));

  return result;
}

/**
 * Set (replace) all tags for an article.
 * This removes existing tags and creates new associations.
 * 
 * @param articleId - The article ID
 * @param tagNames - Array of tag names (max 10)
 * @returns Array of tag names that were set
 * @throws Error if more than MAX_TAGS_PER_ARTICLE tags provided
 */
export async function setArticleTags(
  articleId: string,
  tagNames: string[]
): Promise<string[]> {
  // Validate tag count
  if (tagNames.length > MAX_TAGS_PER_ARTICLE) {
    throw new Error(`Cannot assign more than ${MAX_TAGS_PER_ARTICLE} tags to an article`);
  }

  // Remove existing tag associations
  await db
    .delete(articleTags)
    .where(eq(articleTags.articleId, articleId));

  // Filter out empty tags and get unique names
  const uniqueNames = [...new Set(
    tagNames
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
  )];

  if (uniqueNames.length === 0) {
    return [];
  }

  // Upsert all tags
  const tagObjects: Tag[] = [];
  for (const name of uniqueNames) {
    const tag = await upsertTag(name);
    tagObjects.push(tag);
  }

  // Create junction table entries
  const junctionEntries = tagObjects.map((tag) => ({
    articleId,
    tagId: tag.id,
  }));

  if (junctionEntries.length > 0) {
    await db.insert(articleTags).values(junctionEntries);
  }

  return tagObjects.map((t) => t.name);
}

/**
 * Add a single tag to an article.
 * 
 * @param articleId - The article ID
 * @param tagName - The tag name to add
 * @returns The tag that was added
 */
export async function addTagToArticle(
  articleId: string,
  tagName: string
): Promise<Tag> {
  const currentTags = await getArticleTagObjects(articleId);
  
  if (currentTags.length >= MAX_TAGS_PER_ARTICLE) {
    throw new Error(`Article already has maximum ${MAX_TAGS_PER_ARTICLE} tags`);
  }

  const tag = await upsertTag(tagName);

  // Check if already associated
  const exists = currentTags.some((t) => t.id === tag.id);
  if (!exists) {
    await db.insert(articleTags).values({
      articleId,
      tagId: tag.id,
    });
  }

  return tag;
}

/**
 * Remove a tag from an article.
 * 
 * @param articleId - The article ID
 * @param tagName - The tag name to remove
 */
export async function removeTagFromArticle(
  articleId: string,
  tagName: string
): Promise<void> {
  const slug = slugify(tagName);
  
  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, slug),
  });

  if (!tag) {
    return; // Tag doesn't exist, nothing to remove
  }

  await db
    .delete(articleTags)
    .where(
      and(
        eq(articleTags.articleId, articleId),
        eq(articleTags.tagId, tag.id)
      )
    );
}

/**
 * Get all tags in the database with article count.
 * Useful for tag clouds or autocomplete.
 * 
 * @returns Array of tags with usage count
 */
export async function getAllTagsWithCount(): Promise<Array<Tag & { count: number }>> {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      createdAt: tags.createdAt,
      count: sql<number>`count(${articleTags.articleId})`.as('count'),
    })
    .from(tags)
    .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
    .groupBy(tags.id)
    .orderBy(sql`count(${articleTags.articleId}) DESC`);

  return result;
}

/**
 * Delete orphaned tags (tags not associated with any article).
 * Useful for cleanup operations.
 * 
 * @returns Number of tags deleted
 */
export async function deleteOrphanedTags(): Promise<number> {
  const orphanedTags = await db
    .select({ id: tags.id })
    .from(tags)
    .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
    .where(sql`${articleTags.articleId} IS NULL`);

  if (orphanedTags.length === 0) {
    return 0;
  }

  const ids = orphanedTags.map((t) => t.id);
  
  await db
    .delete(tags)
    .where(inArray(tags.id, ids));

  return orphanedTags.length;
}

/**
 * Search tags by name (partial match).
 * Useful for autocomplete functionality.
 * 
 * @param query - The search query
 * @param limit - Maximum results (default 10)
 * @returns Array of matching tags
 */
export async function searchTags(
  query: string,
  limit: number = 10
): Promise<Tag[]> {
  const searchPattern = `%${query.toLowerCase()}%`;
  
  const result = await db
    .select()
    .from(tags)
    .where(sql`LOWER(${tags.name}) LIKE ${searchPattern}`)
    .limit(limit);

  return result;
}

// ============================================================================
// Admin Module Actions (NEW)
// ============================================================================

/**
 * Get a single tag by ID.
 * 
 * @param id - The tag ID
 * @returns The tag or null if not found
 */
export async function getTagById(id: string): Promise<Tag | null> {
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, id),
  });
  
  return tag || null;
}

/**
 * Check if a tag can be deleted (has no associated articles).
 * 
 * @param id - The tag ID
 * @returns Object with canDelete flag and article count
 */
export async function canDeleteTag(id: string): Promise<{ canDelete: boolean; count: number }> {
  const result = await db
    .select({
      count: sql<number>`count(${articleTags.articleId})`.as('count'),
    })
    .from(articleTags)
    .where(eq(articleTags.tagId, id));
  
  const count = result[0]?.count || 0;
  return { canDelete: count === 0, count };
}

/**
 * Update a tag's name and regenerate its slug.
 * 
 * @param id - The tag ID
 * @param name - The new tag name
 * @returns The updated tag
 * @throws Error if tag not found, name already exists, or validation fails
 */
export async function updateTag(id: string, name: string): Promise<Tag> {
  // Validate the new name
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    throw new Error('Tag name is required');
  }
  
  if (trimmedName.length > MAX_TAG_LENGTH) {
    throw new Error(`Tag name cannot exceed ${MAX_TAG_LENGTH} characters`);
  }
  
  const newSlug = slugify(trimmedName);
  
  if (!newSlug) {
    throw new Error('Tag name must contain valid characters');
  }
  
  // Check if tag exists
  const existingTag = await db.query.tags.findFirst({
    where: eq(tags.id, id),
  });
  
  if (!existingTag) {
    throw new Error('Tag not found');
  }
  
  // Check if another tag already has this name/slug
  const duplicateTag = await db.query.tags.findFirst({
    where: eq(tags.slug, newSlug),
  });
  
  if (duplicateTag && duplicateTag.id !== id) {
    throw new Error('Tag name already exists');
  }
  
  // Update the tag
  const [updatedTag] = await db
    .update(tags)
    .set({
      name: trimmedName.slice(0, MAX_TAG_LENGTH),
      slug: newSlug,
    })
    .where(eq(tags.id, id))
    .returning();
  
  return updatedTag;
}

/**
 * Delete a single tag if it's not associated with any articles.
 * 
 * @param id - The tag ID
 * @throws Error if tag not found or has associated articles
 */
export async function deleteTag(id: string): Promise<void> {
  // Check if tag exists
  const tag = await db.query.tags.findFirst({
    where: eq(tags.id, id),
  });
  
  if (!tag) {
    throw new Error('Tag not found');
  }
  
  // Check if tag has associated articles
  const { canDelete, count } = await canDeleteTag(id);
  
  if (!canDelete) {
    throw new Error(`Cannot delete tag with ${count} article${count === 1 ? '' : 's'}`);
  }
  
  // Delete the tag
  await db.delete(tags).where(eq(tags.id, id));
}

/**
 * Delete multiple tags at once.
 * Tags with associated articles will be skipped.
 * 
 * @param ids - Array of tag IDs to delete
 * @returns Object with count of deleted tags and array of blocked tag IDs
 */
export async function deleteTags(ids: string[]): Promise<{ deleted: number; blocked: string[] }> {
  if (ids.length === 0) {
    return { deleted: 0, blocked: [] };
  }
  
  const blocked: string[] = [];
  const deletable: string[] = [];
  
  // Check each tag
  for (const id of ids) {
    const { canDelete } = await canDeleteTag(id);
    if (canDelete) {
      deletable.push(id);
    } else {
      blocked.push(id);
    }
  }
  
  // Delete deletable tags
  if (deletable.length > 0) {
    await db.delete(tags).where(inArray(tags.id, deletable));
  }
  
  return { deleted: deletable.length, blocked };
}

/**
 * Get tag statistics for the admin dashboard.
 * 
 * @returns Object with total, inUse, and orphaned counts
 */
export async function getTagStats(): Promise<{ total: number; inUse: number; orphaned: number }> {
  const allTags = await getAllTagsWithCount();
  
  const total = allTags.length;
  const inUse = allTags.filter(t => t.count > 0).length;
  const orphaned = total - inUse;
  
  return { total, inUse, orphaned };
}
