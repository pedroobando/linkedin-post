/**
 * Article-Tag Association Operations
 * Server actions for managing article-tag relationships.
 */

'use server';

import { db, eq, and, sql } from '@/db';
import { tags, articleTags } from '@/db/schema';
import { Tag } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';
import { upsertTag } from './ins-tag';

/**
 * Get all tags associated with an article (returns tag names only).
 * @param articleId - The article ID
 * @returns Array of tag names
 */
export const getArticleTags = async (articleId: string): Promise<string[]> => {
  if (!isValidUUID(articleId)) {
    throw new Error(`El ID de artículo ${articleId}, no es valido, favor verificar.`);
  }

  const [data, err] = await tryCatch(
    db
      .select({ name: tags.name })
      .from(tags)
      .innerJoin(articleTags, eq(tags.id, articleTags.tagId))
      .where(eq(articleTags.articleId, articleId))
      .orderBy(tags.name),
  );

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando las etiquetas del artículo, favor verificar.');
  }

  return data.map((t) => t.name);
};

/**
 * Get all tag objects associated with an article.
 * @param articleId - The article ID
 * @returns Array of tag objects
 */
export const getArticleTagObjects = async (articleId: string): Promise<Tag[]> => {
  if (!isValidUUID(articleId)) {
    throw new Error(`El ID de artículo ${articleId}, no es valido, favor verificar.`);
  }

  const [data, err] = await tryCatch(
    db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .innerJoin(articleTags, eq(tags.id, articleTags.tagId))
      .where(eq(articleTags.articleId, articleId))
      .orderBy(tags.name),
  );

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando las etiquetas del artículo, favor verificar.');
  }

  return data as Tag[];
};

/**
 * Set (replace) all tags for an article.
 * This removes existing tags and adds the new ones.
 * @param articleId - The article ID
 * @param tagNames - Array of tag names
 */
export const setArticleTags = async (articleId: string, tagNames: string[]): Promise<void> => {
  if (!isValidUUID(articleId)) {
    throw new Error(`El ID de artículo ${articleId}, no es valido, favor verificar.`);
  }

  // Start by removing all existing tag associations
  const [_, deleteErr] = await tryCatch(db.delete(articleTags).where(eq(articleTags.articleId, articleId)));

  if (deleteErr) {
    console.error(deleteErr.message);
    throw new Error('Error no controlado actualizando las etiquetas del artículo, favor verificar.');
  }

  // If no tags to add, we're done
  if (tagNames.length === 0) {
    return;
  }

  // Get or create tags
  const tagIds: string[] = [];

  for (const tagName of tagNames) {
    if (!tagName.trim()) continue;

    const tag = await upsertTag({ name: tagName.trim() });
    tagIds.push(tag.id);
  }

  // Insert new associations
  if (tagIds.length > 0) {
    const associations = tagIds.map((tagId) => ({
      articleId,
      tagId,
    }));

    const [__, insertErr] = await tryCatch(db.insert(articleTags).values(associations));

    if (insertErr) {
      console.error(insertErr.message);
      throw new Error('Error no controlado asociando etiquetas al artículo, favor verificar.');
    }
  }
};

/**
 * Add a single tag to an article.
 * @param articleId - The article ID
 * @param tagName - The tag name to add
 */
export const addTagToArticle = async (articleId: string, tagName: string): Promise<void> => {
  if (!isValidUUID(articleId)) {
    throw new Error(`El ID de artículo ${articleId}, no es valido, favor verificar.`);
  }

  if (!tagName.trim()) {
    throw new Error('El nombre de la etiqueta no puede estar vacío');
  }

  // Get or create the tag
  const tag = await upsertTag({ name: tagName.trim() });

  // Check if association already exists
  const [existing, existingErr] = await tryCatch(
    db
      .select()
      .from(articleTags)
      .where(and(eq(articleTags.articleId, articleId), eq(articleTags.tagId, tag.id)))
      .limit(1),
  );

  if (existingErr) {
    console.error(existingErr.message);
    throw new Error('Error no controlado verificando la asociación, favor verificar.');
  }

  // If association already exists, do nothing
  if (existing && existing.length > 0) {
    return;
  }

  // Create the association
  const [_, err] = await tryCatch(
    db.insert(articleTags).values({
      articleId,
      tagId: tag.id,
    }),
  );

  if (err) {
    console.error(err.message);
    throw new Error('Error no controlado agregando etiqueta al artículo, favor verificar.');
  }
};

/**
 * Remove a single tag from an article.
 * @param articleId - The article ID
 * @param tagId - The tag ID to remove
 */
export const removeTagFromArticle = async (articleId: string, tagId: string): Promise<void> => {
  if (!isValidUUID(articleId)) {
    throw new Error(`El ID de artículo ${articleId}, no es valido, favor verificar.`);
  }

  if (!isValidUUID(tagId)) {
    throw new Error(`El ID de etiqueta ${tagId}, no es valido, favor verificar.`);
  }

  const [_, err] = await tryCatch(
    db.delete(articleTags).where(and(eq(articleTags.articleId, articleId), eq(articleTags.tagId, tagId))),
  );

  if (err) {
    console.error(err.message);
    throw new Error('Error no controlado removiendo etiqueta del artículo, favor verificar.');
  }
};
