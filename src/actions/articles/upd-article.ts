/**
 * Article Update Operations
 * Server actions for updating articles.
 */

'use server';

import { db, eq } from '@/db';
import { articles, tags, articleTags } from '@/db/schema';
import type { Article, NewArticle, ArticleStatus } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';
import { setArticleTags } from '@/actions/tags/ass-tag';
import type { ArticleWithTags } from './utils';

/**
 * Update an existing article.
 * @param id - The article ID
 * @param data - Article data to update
 * @returns The updated article
 */
export const updateArticle = async (
  id: string,
  data: Partial<NewArticle> & { tagNames?: string[] }
): Promise<Article> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ID ${id}, no es valido, favor verificar.`);
  }

  const { tagNames, ...articleData } = data;

  const updateData: Partial<typeof articles.$inferInsert> = {
    ...articleData,
    updatedAt: new Date(),
  };

  const [result, err] = await tryCatch(
    db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning()
  );

  if (!result && err) {
    console.error(err.message);
    throw new Error('Error no controlado actualizando el artículo, favor verificar.');
  }

  if (!result || result.length === 0) {
    throw new Error('Artículo no encontrado');
  }

  // If tags provided, update associations
  if (tagNames) {
    await setArticleTags(id, tagNames);
  }

  return result[0] as Article;
};

/**
 * Update just the status of an article.
 * @param id - The article ID
 * @param status - The new status
 * @returns The updated article
 */
export const updateArticleStatus = async (
  id: string,
  status: ArticleStatus
): Promise<Article> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ID ${id}, no es valido, favor verificar.`);
  }

  const updateData: Partial<typeof articles.$inferInsert> = {
    status,
    updatedAt: new Date(),
  };

  // Set publishedAt if status is published
  if (status === 'published') {
    updateData.publishedAt = new Date();
  }

  const [result, err] = await tryCatch(
    db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning()
  );

  if (!result && err) {
    console.error(err.message);
    throw new Error('Error no controlado actualizando el estado del artículo, favor verificar.');
  }

  if (!result || result.length === 0) {
    throw new Error('Artículo no encontrado');
  }

  return result[0] as Article;
};

/**
 * Upsert an article (create or update).
 * @param data - Article data with optional id for update
 * @returns The created or updated article
 */
export const upsertArticle = async (
  data: NewArticle & { id?: string; tagNames?: string[] }
): Promise<Article> => {
  const { id, tagNames, ...articleData } = data;

  // If id provided, try to update
  if (id) {
    if (!isValidUUID(id)) {
      throw new Error(`El ID ${id}, no es valido, favor verificar.`);
    }

    // Check if article exists
    const [existing, existingErr] = await tryCatch(
      db.select().from(articles).where(eq(articles.id, id)).limit(1)
    );

    if (existingErr) {
      console.error(existingErr.message);
      throw new Error('Error no controlado verificando el artículo, favor verificar.');
    }

    // If exists, update
    if (existing && existing.length > 0) {
      return updateArticle(id, { ...articleData, tagNames });
    }
  }

  // Otherwise insert new
  // Import insertArticle from ins-article to avoid circular dependency
  const { insertArticle } = await import('./ins-article');
  return insertArticle({ ...articleData, tagNames });
};

/**
 * Update an article with tags
 * Firma compatible con editor-store: updateArticle(id, data, tags)
 * @param id - The article ID
 * @param data - Article data to update
 * @param tagNames - Optional array of tag names
 * @returns The updated article with tags
 */
export const updateArticleWithTags = async (
  id: string,
  data: Partial<NewArticle> & { status?: ArticleStatus; publishedAt?: Date | null },
  tagNames?: string[]
): Promise<ArticleWithTags> => {
  const result = await updateArticle(id, {
    ...data,
    tagNames,
  });
  
  // Get updated tags for the article
  const [tagsData] = await tryCatch(
    db
      .select({ name: tags.name })
      .from(tags)
      .innerJoin(articleTags, eq(tags.id, articleTags.tagId))
      .where(eq(articleTags.articleId, result.id))
      .orderBy(tags.name)
  );
  
  return {
    ...result,
    tags: tagsData?.map((t) => t.name) || [],
  };
};
