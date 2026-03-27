/**
 * Tag Delete Operations
 * Server actions for deleting tags.
 */

'use server';

import { db, eq, sql, inArray } from '@/db';
import { tags, articleTags } from '@/db/schema';
import { tryCatch } from '@/utils';
import { canModifyTag } from './utils';

/**
 * Delete a tag by ID.
 * Requires userId parameter for ownership validation.
 * Global tags (userId = null) can be deleted by any authenticated user.
 * Personal tags can only be deleted by their owner.
 *
 * @param id - The tag ID
 * @param userId - The ID of the user attempting to delete (required)
 * @throws Error if userId is not provided, tag not found, or user doesn't have permission
 */
export const deleteTag = async (id: string, userId: string): Promise<void> => {
  // Verify userId is provided
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Fetch the tag to check ownership
  const [tagData, tagErr] = await tryCatch(
    db.select().from(tags).where(eq(tags.id, id)).limit(1)
  );

  if (tagErr) {
    console.error(tagErr.message);
    throw new Error('Error no controlado buscando la etiqueta, favor verificar.');
  }

  if (!tagData || tagData.length === 0) {
    throw new Error('Tag not found');
  }

  const tag = tagData[0];

  // Validate ownership
  if (!canModifyTag(tag, userId)) {
    throw new Error('You can only delete your own tags or global tags');
  }

  const [_, err] = await tryCatch(db.delete(tags).where(eq(tags.id, id)));

  if (err) {
    console.error(err.message);
    throw new Error('Error no controlado eliminando la etiqueta, favor verificar.');
  }
};

/**
 * Delete multiple tags by their IDs.
 * Only deletes tags that are not in use (orphaned).
 * @param ids - Array of tag IDs
 * @returns Object with count of deleted tags and array of blocked (in-use) tag IDs
 */
export const deleteTags = async (ids: string[]): Promise<{ deleted: number; blocked: string[] }> => {
  // Find which tags are in use
  const [inUseData, inUseErr] = await tryCatch(
    db.select({ tagId: articleTags.tagId }).from(articleTags).where(inArray(articleTags.tagId, ids)),
  );

  if (inUseErr) {
    console.error(inUseErr.message);
    throw new Error('Error no controlado verificando etiquetas en uso, favor verificar.');
  }

  const inUseIds = new Set(inUseData?.map((row) => row.tagId) || []);
  const deletableIds = ids.filter((id) => !inUseIds.has(id));
  const blockedIds = ids.filter((id) => inUseIds.has(id));

  // Delete only deletable tags
  if (deletableIds.length > 0) {
    const [_, err] = await tryCatch(db.delete(tags).where(inArray(tags.id, deletableIds)));

    if (err) {
      console.error(err.message);
      throw new Error('Error no controlado eliminando las etiquetas, favor verificar.');
    }
  }

  return { deleted: deletableIds.length, blocked: blockedIds };
};

/**
 * Delete all orphaned tags (tags with no associated articles).
 * @returns Number of deleted tags
 */
export const deleteOrphanedTags = async (): Promise<number> => {
  // Find tags that don't have any associations in articleTags
  const [orphanedTags, findErr] = await tryCatch(
    db
      .select({ id: tags.id })
      .from(tags)
      .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
      .where(sql`${articleTags.tagId} IS NULL`),
  );

  if (findErr) {
    console.error(findErr.message);
    throw new Error('Error no controlado buscando etiquetas huérfanas, favor verificar.');
  }

  if (!orphanedTags || orphanedTags.length === 0) {
    return 0;
  }

  const idsToDelete = orphanedTags.map((t) => t.id);

  const [_, deleteErr] = await tryCatch(db.delete(tags).where(inArray(tags.id, idsToDelete)));

  if (deleteErr) {
    console.error(deleteErr.message);
    throw new Error('Error no controlado eliminando etiquetas huérfanas, favor verificar.');
  }

  return idsToDelete.length;
};
