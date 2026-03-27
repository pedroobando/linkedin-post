/**
 * Article Delete Operations
 * Server actions for deleting articles.
 */

'use server';

import { db, eq, inArray } from '@/db';
import { articles } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';

/**
 * Delete a single article by ID.
 * This cascades to articleTags via foreign key.
 * @param id - The article ID
 */
export const deleteArticle = async (id: string): Promise<void> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ID ${id}, no es valido, favor verificar.`);
  }

  const [_, err] = await tryCatch(
    db.delete(articles).where(eq(articles.id, id))
  );

  if (err) {
    console.error(err.message);
    throw new Error('Error no controlado eliminando el artículo, favor verificar.');
  }
};

/**
 * Delete multiple articles by their IDs.
 * This cascades to articleTags via foreign key.
 * @param ids - Array of article IDs
 */
export const deleteArticles = async (ids: string[]): Promise<void> => {
  // Validate all IDs
  for (const id of ids) {
    if (!isValidUUID(id)) {
      throw new Error(`El ID ${id}, no es valido, favor verificar.`);
    }
  }

  const [_, err] = await tryCatch(
    db.delete(articles).where(inArray(articles.id, ids))
  );

  if (err) {
    console.error(err.message);
    throw new Error('Error no controlado eliminando los artículos, favor verificar.');
  }
};
