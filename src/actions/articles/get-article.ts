/**
 * Article Read Operations
 * Server actions for reading and querying articles.
 */

'use server';

import { db, eq, count, and, like, sql, inArray, or } from '@/db';
import { articles, tags, articleTags } from '@/db/schema';
import type { Article, ArticleStatus } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';
import type { ArticleWithTags, ArticleStats } from './utils';

/**
 * Get all articles ordered by updatedAt desc.
 * @returns Array of all articles
 */
export const getAllArticles = async (): Promise<Article[]> => {
  const [data, err] = await tryCatch(
    db.select().from(articles).orderBy(sql`${articles.updatedAt} DESC`)
  );

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando los artículos, favor verificar.');
  }

  return data as Article[];
};

/**
 * Get a single article by ID with tags.
 * @param id - The article ID
 * @returns The article with tags or null if not found
 */
export const getArticleById = async (id: string): Promise<ArticleWithTags | null> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ID ${id}, no es valido, favor verificar.`);
  }

  const [articleData, articleErr] = await tryCatch(
    db.select().from(articles).where(eq(articles.id, id)).limit(1)
  );

  if (articleErr && !articleData) {
    console.error(articleErr.message);
    throw new Error('Error no controlado buscando el artículo, favor verificar.');
  }

  if (!articleData || articleData.length === 0) {
    return null;
  }

  // Get tags for this article
  const [tagsData, tagsErr] = await tryCatch(
    db
      .select({ name: tags.name })
      .from(tags)
      .innerJoin(articleTags, eq(tags.id, articleTags.tagId))
      .where(eq(articleTags.articleId, id))
      .orderBy(tags.name)
  );

  if (tagsErr) {
    console.error(tagsErr.message);
    throw new Error('Error no controlado buscando las etiquetas del artículo, favor verificar.');
  }

  return {
    ...(articleData[0] as Article),
    tags: tagsData.map((t) => t.name),
  };
};

/**
 * Get articles by user ID.
 * @param userId - The user ID
 * @returns Array of articles for the user
 */
export const getArticlesByUserId = async (userId: string): Promise<Article[]> => {
  if (!isValidUUID(userId)) {
    throw new Error(`El ID de usuario ${userId}, no es valido, favor verificar.`);
  }

  const [data, err] = await tryCatch(
    db
      .select()
      .from(articles)
      .where(eq(articles.userId, userId))
      .orderBy(sql`${articles.updatedAt} DESC`)
  );

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando los artículos del usuario, favor verificar.');
  }

  return data as Article[];
};

/**
 * Get articles by status.
 * @param status - The article status
 * @returns Array of articles with the given status
 */
export const getArticlesByStatus = async (status: ArticleStatus): Promise<Article[]> => {
  const [data, err] = await tryCatch(
    db
      .select()
      .from(articles)
      .where(eq(articles.status, status))
      .orderBy(sql`${articles.updatedAt} DESC`)
  );

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando los artículos por estado, favor verificar.');
  }

  return data as Article[];
};

/**
 * Search articles by title or content.
 * @param query - The search query
 * @param limit - Optional limit for results
 * @returns Array of matching articles
 */
export const searchArticles = async (query: string, limit?: number): Promise<Article[]> => {
  const searchPattern = `%${query}%`;

  const baseQuery = db
    .select()
    .from(articles)
    .where(
      or(
        like(articles.title, searchPattern),
        like(articles.content, searchPattern)
      )
    )
    .orderBy(sql`${articles.updatedAt} DESC`);

  const finalQuery = limit && limit > 0 ? baseQuery.limit(limit) : baseQuery;

  const [data, err] = await tryCatch(finalQuery);

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando los artículos, favor verificar.');
  }

  return data as Article[];
};

/**
 * Get all articles with their tag names.
 * @returns Array of articles with tags
 */
export const getArticlesWithTags = async (): Promise<ArticleWithTags[]> => {
  // Get all articles
  const [articlesData, articlesErr] = await tryCatch(
    db.select().from(articles).orderBy(sql`${articles.updatedAt} DESC`)
  );

  if (articlesErr && !articlesData) {
    console.error(articlesErr.message);
    throw new Error('Error no controlado buscando los artículos, favor verificar.');
  }

  if (!articlesData || articlesData.length === 0) {
    return [];
  }

  // Get all article-tag associations
  const [associations, assocErr] = await tryCatch(
    db
      .select({
        articleId: articleTags.articleId,
        tagName: tags.name,
      })
      .from(articleTags)
      .innerJoin(tags, eq(articleTags.tagId, tags.id))
  );

  if (assocErr) {
    console.error(assocErr.message);
    throw new Error('Error no controlado buscando las etiquetas, favor verificar.');
  }

  // Group tags by article
  const tagsByArticle = new Map<string, string[]>();
  for (const assoc of associations || []) {
    const existing = tagsByArticle.get(assoc.articleId) || [];
    existing.push(assoc.tagName);
    tagsByArticle.set(assoc.articleId, existing);
  }

  // Combine articles with their tags
  return articlesData.map((article) => ({
    ...(article as Article),
    tags: tagsByArticle.get(article.id) || [],
  }));
};

/**
 * Get article statistics by status.
 * @returns Statistics object with counts by status
 */
export const getArticleStats = async (): Promise<ArticleStats> => {
  // Get total count
  const [totalResult, totalErr] = await tryCatch(
    db.select({ count: count() }).from(articles)
  );

  if (totalErr || !totalResult) {
    console.error(totalErr?.message);
    throw new Error('Error no controlado obteniendo estadísticas, favor verificar.');
  }

  // Get counts by status
  const [statusResults, statusErr] = await tryCatch(
    db
      .select({
        status: articles.status,
        count: count(),
      })
      .from(articles)
      .groupBy(articles.status)
  );

  if (statusErr || !statusResults) {
    console.error(statusErr?.message);
    throw new Error('Error no controlado obteniendo estadísticas, favor verificar.');
  }

  const stats: ArticleStats = {
    total: Number(totalResult[0].count),
    draft: 0,
    scheduled: 0,
    published: 0,
    archived: 0,
  };

  for (const row of statusResults) {
    const status = row.status as ArticleStatus;
    stats[status] = Number(row.count);
  }

  return stats;
};
