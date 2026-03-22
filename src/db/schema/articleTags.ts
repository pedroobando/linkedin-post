import { sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { articles } from './articles';
import { tags } from './tags';

/**
 * Junction table for many-to-many relationship between articles and tags.
 * Allows articles to have multiple tags and tags to be associated with multiple articles.
 */
export const articleTags = sqliteTable(
  'article_tags',
  {
    articleId: text('article_id')
      .notNull()
      .references(() => articles.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.articleId, table.tagId] }),
  })
);

export type ArticleTag = typeof articleTags.$inferSelect;
export type NewArticleTag = typeof articleTags.$inferInsert;
