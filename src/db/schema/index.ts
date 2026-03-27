// Export all schemas
export * from './auth.schema';
export * from './articles';
export * from './templates';
export * from './linkedInTokens';
export * from './publishHistory';
export * from './tags';
export * from './articleTags';

// Re-export types explicitly
export type { Article, NewArticle, ArticleStatus } from './articles';
export type { Tag, NewTag } from './tags';
export type { ArticleTag, NewArticleTag } from './articleTags';

// Import for relations
import { relations } from 'drizzle-orm';
import { articles } from './articles';
import { tags } from './tags';
import { articleTags } from './articleTags';
import { users, accounts, sessions, verifications } from './auth.schema';

/**
 * Define Drizzle ORM relations between tables.
 * These relations enable type-safe joins and eager loading.
 */

// Relations for articles
export const articlesRelations = relations(articles, ({ one, many }) => ({
  user: one(users, {
    fields: [articles.userId],
    references: [users.id],
  }),
  articleTags: many(articleTags),
}));

// Relations for tags
export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
}));

// Relations for articleTags junction table
export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

// export const dbSchema = {
//   ...articleTags,
//   ...articles,
//   ...tags,
//   ...users,

//   ...accounts,
//   ...sessions,
//   ...verifications,
//   // ... your other application schemas
// } as const;
