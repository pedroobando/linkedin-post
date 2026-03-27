/**
 * Tag Update Operations
 * Server actions for updating tags.
 */

'use server';

import { db, eq } from '@/db';
import { tags } from '@/db/schema';
import { Tag } from '@/db/schema';
import { tryCatch } from '@/utils';
import { slugify, canModifyTag } from './utils';

/**
 * Update an existing tag.
 * Requires userId parameter for ownership validation.
 * Global tags (userId = null) can be updated by any authenticated user.
 * Personal tags can only be updated by their owner.
 *
 * @param id - The tag ID
 * @param data - Tag name (string) or partial tag data to update
 * @param userId - The ID of the user attempting to update (required)
 * @returns The updated tag
 * @throws Error if userId is not provided, tag not found, or user doesn't have permission
 */
export const updateTag = async (
  id: string,
  data: string | { name?: string; slug?: string },
  userId: string,
): Promise<Tag> => {
  // Verify userId is provided
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Fetch the tag to check ownership
  const [tagData, tagErr] = await tryCatch(db.select().from(tags).where(eq(tags.id, id)).limit(1));

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
    throw new Error('You can only edit your own tags or global tags');
  }

  // Prepare update data
  const updateData: Partial<typeof tags.$inferInsert> = {};

  // Handle string input (just the name)
  if (typeof data === 'string') {
    updateData.name = data.trim();
    updateData.slug = slugify(data.trim());
  } else {
    // Handle object input
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.slug !== undefined) {
      updateData.slug = data.slug;
    }
  }

  const [dataResult, errResult] = await tryCatch(db.update(tags).set(updateData).where(eq(tags.id, id)).returning());

  if (!dataResult && errResult) {
    console.error(errResult.message);
    throw new Error('Error no controlado actualizando la etiqueta, favor verificar.');
  }

  if (!dataResult || dataResult.length === 0) {
    throw new Error('Etiqueta no encontrada');
  }

  return dataResult[0] as Tag;
};
