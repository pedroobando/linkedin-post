/**
 * Tag Insert/Upsert Operations
 * Server actions for creating tags.
 */

'use server';

import { db, sql } from '@/db';
import { tags } from '@/db/schema';
import { Tag } from '@/db/schema';
import { tryCatch } from '@/utils';
import { slugify } from './utils';

/**
 * Create a new tag or update existing if name already exists.
 * Requires userId parameter for ownership. Sets userId to provided user's ID.
 *
 * @param data - Tag name (string) or tag data to insert
 * @param userId - The ID of the user creating the tag (required)
 * @returns The created or existing tag
 * @throws Error if userId is not provided
 */
export const upsertTag = async (
  data: string | { name: string; slug?: string },
  userId: string
): Promise<Tag> => {
  // Verify userId is provided
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Normalize input
  const tagName = typeof data === 'string' ? data.trim() : data.name.trim();
  const tagSlug = typeof data === 'string' ? slugify(tagName) : data.slug || slugify(tagName);

  console.log(tagName);

  // Check if tag with this name or slug already exists
  const [existingData, existingErr] = await tryCatch(
    db
      .select()
      .from(tags)
      .where(sql`${tags.name} = ${tagName} OR ${tags.slug} = ${tagSlug}`)
      .limit(1),
  );

  if (existingErr) {
    throw new Error('Error no controlado verificando la etiqueta, favor verificar.');
  }

  // If tag exists, return it
  if (existingData && existingData.length > 0) {
    return existingData[0] as Tag;
  }

  // Create new tag with userId
  const [dataResult, errResult] = await tryCatch(
    db
      .insert(tags)
      .values({
        name: tagName,
        slug: tagSlug,
        userId: userId, // Set owner to provided user
      })
      .returning(),
  );

  if (!dataResult && errResult) {
    throw new Error('Error no controlado creando la etiqueta, favor verificar.');
  }

  return dataResult![0] as Tag;
};
