/**
 * Article Insert Operations
 * Server actions for creating articles.
 */

'use server';

import { db, eq } from '@/db';
import { articles, tags, articleTags } from '@/db/schema';
import type { Article, NewArticle } from '@/db/schema';
import { tryCatch } from '@/utils';
import { setArticleTags } from '@/actions/tags/ass-tag';
import { upsertTag } from '@/actions/tags/ins-tag';
import type { ArticleWithTags } from './utils';

/**
 * Insert a new article with optional tags.
 * @param data - Article data and optional tagNames array
 * @param userId - The ID of the user creating the article (required for tag creation)
 * @returns The created article
 */
export const insertArticle = async (
  data: NewArticle & { tagNames?: string[] },
  userId?: string
): Promise<Article> => {
  const { tagNames, ...articleData } = data;

  // Insert the article
  const [result, err] = await tryCatch(
    db
      .insert(articles)
      .values({
        ...articleData,
        updatedAt: new Date(),
      })
      .returning()
  );

  if (!result && err) {
    console.error(err.message);
    throw new Error('Error no controlado creando el artículo, favor verificar.');
  }

  const article = result![0] as Article;

  // If tags provided, create associations
  if (tagNames && tagNames.length > 0) {
    if (!userId) {
      throw new Error('User ID is required to create tags');
    }
    await setArticleTags(article.id, tagNames, userId);
  }

  return article;
};

/**
 * Create a new article with tags
 * Wrapper con firma compatible: createArticle(data, tags, userId)
 * @param data - Article data
 * @param tagNames - Optional array of tag names
 * @param userId - The ID of the user creating the article (required for tag creation)
 * @returns The created article with tags
 */
export const createArticle = async (
  data: NewArticle,
  tagNames?: string[],
  userId?: string
): Promise<ArticleWithTags> => {
  const result = await insertArticle(
    {
      ...data,
      tagNames,
    },
    userId
  );
  
  // Get tags for the article to return ArticleWithTags
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
