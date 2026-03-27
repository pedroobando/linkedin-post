import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './auth.schema';

/**
 * Tags table for normalizing article tags in the database.
 * Replaces the JSON tags column in articles table with a relational approach.
 * 
 * userId = null: Global/System tag (editable by any authenticated user)
 * userId != null: Personal tag (editable only by owner)
 */
export const tags = sqliteTable('tags', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' }),  // Nullable - null = global tag
  name: text('name').notNull().unique(),  // Global uniqueness maintained
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
