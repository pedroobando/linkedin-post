import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users';

export const articleStatusEnum = ['draft', 'scheduled', 'published', 'archived'] as const;
export type ArticleStatus = typeof articleStatusEnum[number];

export const articles = sqliteTable('articles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  summary: text('summary'),
  status: text('status', { enum: articleStatusEnum }).notNull().default('draft'),
  tags: text('tags'), // JSON array of tags
  linkedInPostId: text('linked_in_post_id'), // ID when published to LinkedIn
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Define types explicitly instead of using $inferSelect
export type Article = {
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

export type NewArticle = {
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