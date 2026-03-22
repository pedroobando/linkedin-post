import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { articles } from './articles';

export const publishHistory = sqliteTable('publish_history', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  articleId: text('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  platform: text('platform', { enum: ['linkedin', 'twitter', 'other'] }).notNull(),
  platformPostId: text('platform_post_id'),
  status: text('status', { enum: ['pending', 'success', 'failed'] }).notNull(),
  errorMessage: text('error_message'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export type PublishHistory = typeof publishHistory.$inferSelect;
export type NewPublishHistory = typeof publishHistory.$inferInsert;