/**
 * Tag Read Operations
 * Server actions for reading and querying tags.
 */

'use server';

import { db, eq, count, like, sql } from '@/db';
import { tags, articleTags } from '@/db/schema';
import { Tag } from '@/db/schema';
import { tryCatch } from '@/utils';

/**
 * Tag with article count
 */
export interface TagWithCount extends Tag {
  count: number;
}

/**
 * Get all tags ordered by name.
 * @returns Array of all tags
 */
export const getAllTags = async (): Promise<Tag[]> => {
  const [data, err] = await tryCatch(db.select().from(tags).orderBy(tags.name));

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando las etiquetas, favor verificar.');
  }

  return data as Tag[];
};

/**
 * Get a tag by its ID.
 * @param id - The tag ID
 * @returns The tag or null if not found
 */
export const getTagById = async (id: string): Promise<Tag | null> => {
  const [data, err] = await tryCatch(db.select().from(tags).where(eq(tags.id, id)).limit(1));

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando la etiqueta, favor verificar.');
  }

  return data && data.length > 0 ? (data[0] as Tag) : null;
};

/**
 * Get a tag by its slug.
 * @param slug - The tag slug
 * @returns The tag or null if not found
 */
export const getTagBySlug = async (slug: string): Promise<Tag | null> => {
  const [data, err] = await tryCatch(db.select().from(tags).where(eq(tags.slug, slug)).limit(1));

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando la etiqueta, favor verificar.');
  }

  return data && data.length > 0 ? (data[0] as Tag) : null;
};

/**
 * Get all tags with their article count.
 * @returns Array of tags with article count
 */
export const getAllTagsWithCount = async (): Promise<TagWithCount[]> => {
  const [data, err] = await tryCatch(
    db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        createdAt: tags.createdAt,
        userId: tags.userId,
        count: sql<number>`count(${articleTags.articleId})`.mapWith(Number),
      })
      .from(tags)
      .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
      .groupBy(tags.id)
      .orderBy(tags.name),
  );

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando las etiquetas, favor verificar.');
  }

  return data as TagWithCount[];
};

/**
 * Search tags by name (partial match).
 * @param query - The search query
 * @param limit - Optional limit for results
 * @returns Array of matching tags
 */
export const searchTags = async (query: string, limit?: number): Promise<Tag[]> => {
  const searchPattern = `%${query}%`;

  const baseQuery = db.select().from(tags).where(like(tags.name, searchPattern)).orderBy(tags.name);

  const finalQuery = limit && limit > 0 ? baseQuery.limit(limit) : baseQuery;

  const [data, err] = await tryCatch(finalQuery);

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando las etiquetas, favor verificar.');
  }

  return data as Tag[];
};

/**
 * Check if a tag can be safely deleted (has no articles).
 * @param id - The tag ID
 * @returns Boolean indicating if tag can be deleted
 */
export const canDeleteTag = async (id: string): Promise<boolean> => {
  const [data, err] = await tryCatch(db.select({ count: count() }).from(articleTags).where(eq(articleTags.tagId, id)));

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado verificando la etiqueta, favor verificar.');
  }

  const articleCount = Number(data![0].count);
  return articleCount === 0;
};

/**
 * Get tag statistics.
 * @returns Statistics object with total tags and tags with articles
 */
export const getTagStats = async (): Promise<{
  total: number;
  inUse: number;
  orphaned: number;
}> => {
  // Get total count
  const [totalResult, totalErr] = await tryCatch(db.select({ count: count() }).from(tags));

  if (totalErr || !totalResult) {
    console.error(totalErr?.message);
    throw new Error('Error no controlado obteniendo estadísticas, favor verificar.');
  }

  // Get count of tags that have articles
  const [usedResult, usedErr] = await tryCatch(
    db.select({ count: sql<number>`count(DISTINCT ${articleTags.tagId})`.mapWith(Number) }).from(articleTags),
  );

  if (usedErr || !usedResult) {
    console.error(usedErr?.message);
    throw new Error('Error no controlado obteniendo estadísticas, favor verificar.');
  }

  const total = Number(totalResult[0].count);
  const inUse = Number(usedResult[0].count);
  const orphaned = total - inUse;

  return { total, inUse, orphaned };
};
