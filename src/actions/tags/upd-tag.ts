/**
 * Tag Update Operations
 * Server actions for updating tags.
 */

'use server';

import { db, eq } from '@/db';
import { tags } from '@/db/schema';
import { Tag } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';
import { slugify } from './utils';

/**
 * Update an existing tag.
 * @param id - The tag ID
 * @param data - Tag name (string) or partial tag data to update
 * @returns The updated tag
 */
export const updateTag = async (id: string, data: string | { name?: string; slug?: string }): Promise<Tag> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ID ${id}, no es valido, favor verificar.`);
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
