/**
 * Article Actions
 * Server actions for CRUD operations on articles with relational tag support.
 */

'use server';

import { db } from '@/db';
import { articles } from '@/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getArticleTags, setArticleTags, getAllTagsWithCount } from '@/actions/tags';

// Define types inline to work around Turbopack type resolution issues
export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface Article {
  id: string;
  userId: string;
  title: string;
  content: string;
  summary: string | null;
  status: ArticleStatus;
  tags: string | null;
  linkedInPostId: string | null;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewArticle {
  id?: string;
  userId: string;
  title: string;
  content: string;
  summary?: string | null;
  status?: ArticleStatus;
  tags?: string | null;
  linkedInPostId?: string | null;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ArticleWithTags extends Omit<Article, 'tags'> {
  tags: string[];
}

/**
 * Get all articles with their tags.
 * @returns Array of articles with tags as string arrays
 */
export async function getArticles(): Promise<ArticleWithTags[]> {
  const allArticles = await db.select().from(articles).orderBy(desc(articles.createdAt));

  // Fetch tags for each article in parallel
  const articlesWithTags = await Promise.all(
    allArticles.map(async (article) => {
      const tagNames = await getArticleTags(article.id);
      return {
        ...article,
        tags: tagNames,
      };
    }),
  );

  return articlesWithTags;
}

/**
 * Get articles by user ID with their tags.
 * @param userId - The user ID to filter by
 * @returns Array of articles with tags
 */
export async function getArticlesByUser(userId: string): Promise<ArticleWithTags[]> {
  const userArticles = await db
    .select()
    .from(articles)
    .where(eq(articles.userId, userId))
    .orderBy(desc(articles.createdAt));

  const articlesWithTags = await Promise.all(
    userArticles.map(async (article) => {
      const tagNames = await getArticleTags(article.id);
      return {
        ...article,
        tags: tagNames,
      };
    }),
  );

  return articlesWithTags;
}

/**
 * Get a single article by ID with its tags.
 * @param id - The article ID
 * @returns Article with tags or null if not found
 */
export async function getArticleById(id: string): Promise<ArticleWithTags | null> {
  const [article] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);

  if (!article) {
    return null;
  }

  const tagNames = await getArticleTags(article.id);

  return {
    ...article,
    tags: tagNames,
  };
}

/**
 * Get articles by tag slug.
 * @param tagSlug - The tag slug to filter by
 * @returns Array of articles with tags
 */
export async function getArticlesByTag(tagSlug: string): Promise<ArticleWithTags[]> {
  const { tags, articleTags } = await import('@/db/schema');

  const taggedArticles = await db
    .select({
      id: articles.id,
      userId: articles.userId,
      title: articles.title,
      content: articles.content,
      summary: articles.summary,
      status: articles.status,
      tags: articles.tags,
      linkedInPostId: articles.linkedInPostId,
      scheduledAt: articles.scheduledAt,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
    })
    .from(articles)
    .innerJoin(articleTags, eq(articles.id, articleTags.articleId))
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(tags.slug, tagSlug))
    .orderBy(desc(articles.createdAt));

  const articlesWithTags = await Promise.all(
    taggedArticles.map(async (article) => {
      const tagNames = await getArticleTags(article.id);
      return {
        ...article,
        tags: tagNames,
      };
    }),
  );

  return articlesWithTags;
}

/**
 * Create a new article with tags.
 * @param data - Article data excluding id and timestamps
 * @param tagNames - Optional array of tag names
 * @returns The created article with tags
 */
export async function createArticle(
  data: Omit<NewArticle, 'id' | 'createdAt' | 'updatedAt'>,
  tagNames: string[] = [],
): Promise<ArticleWithTags> {
  const now = new Date();

  const [article] = await db
    .insert(articles)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Set tags if provided
  if (tagNames.length > 0) {
    await setArticleTags(article.id, tagNames);
  }

  const savedTagNames = await getArticleTags(article.id);

  return {
    ...article,
    tags: savedTagNames,
  };
}

/**
 * Update an existing article and its tags.
 * @param id - The article ID
 * @param data - Partial article data to update
 * @param tagNames - Optional new array of tag names (replaces existing)
 * @returns The updated article with tags
 */
export async function updateArticle(
  id: string,
  data: Partial<Omit<NewArticle, 'id' | 'createdAt' | 'updatedAt'>>,
  tagNames?: string[],
): Promise<ArticleWithTags> {
  const now = new Date();

  const [article] = await db
    .update(articles)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(articles.id, id))
    .returning();

  if (!article) {
    throw new Error('Article not found');
  }

  // Update tags if provided
  if (tagNames !== undefined) {
    await setArticleTags(article.id, tagNames);
  }

  const savedTagNames = await getArticleTags(article.id);

  return {
    ...article,
    tags: savedTagNames,
  };
}

/**
 * Delete an article and its tag associations.
 * Tag associations are automatically deleted via cascade.
 * @param id - The article ID
 */
export async function deleteArticle(id: string): Promise<void> {
  await db.delete(articles).where(eq(articles.id, id));
}

/**
 * Search articles by title or content.
 * @param query - The search query
 * @returns Array of matching articles with tags
 */
export async function searchArticles(query: string): Promise<ArticleWithTags[]> {
  const searchPattern = `%${query}%`;

  const matchingArticles = await db
    .select()
    .from(articles)
    .where(or(sql`${articles.title} LIKE ${searchPattern}`, sql`${articles.content} LIKE ${searchPattern}`))
    .orderBy(desc(articles.createdAt));

  const articlesWithTags = await Promise.all(
    matchingArticles.map(async (article) => {
      const tagNames = await getArticleTags(article.id);
      return {
        ...article,
        tags: tagNames,
      };
    }),
  );

  return articlesWithTags;
}

/**
 * Get article statistics including tag counts.
 * @returns Statistics object
 */
export async function getArticleStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  totalTags: number;
}> {
  const totalResult = await db.select({ count: sql<number>`count(*)` }).from(articles);

  const byStatusResult = await db
    .select({
      status: articles.status,
      count: sql<number>`count(*)`,
    })
    .from(articles)
    .groupBy(articles.status);

  const tagCount = await getAllTagsWithCount();

  const byStatus: Record<string, number> = {};
  for (const row of byStatusResult) {
    byStatus[row.status] = row.count;
  }

  return {
    total: totalResult[0].count,
    byStatus,
    totalTags: tagCount.length,
  };
}

// Helper for OR condition
function or(...conditions: unknown[]) {
  return sql`(${conditions.join(' OR ')})`;
}
