/**
 * Article Utilities
 * Types and re-exports shared across article operations.
 */

import type { Article, NewArticle, ArticleStatus } from '@/db/schema';

export interface ArticleWithTags extends Article {
  tags: string[];
}

export interface ArticleStats {
  total: number;
  draft: number;
  scheduled: number;
  published: number;
  archived: number;
}

export type { Article, NewArticle, ArticleStatus };
