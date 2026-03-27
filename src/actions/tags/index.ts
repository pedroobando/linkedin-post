/**
 * Tag Actions - Barrel Export
 * Re-exporta todas las funciones de etiquetas con nombres consistentes.
 */

// READ Operations
export {
  getAllTags,
  getTagById,
  getTagBySlug,
  getAllTagsWithCount,
  searchTags,
} from './get-tag';

// CREATE Operations
export { upsertTag } from './ins-tag';

// UPDATE Operations
export { updateTag } from './upd-tag';

// DELETE Operations
export {
  deleteTag,
  deleteTags,
  deleteOrphanedTags,
} from './del-tag';

// Admin Operations
export { canDeleteTag, getTagStats } from './get-tag';

// Article-Tag Association Operations
export {
  getArticleTags,
  getArticleTagObjects,
  setArticleTags,
  addTagToArticle,
  removeTagFromArticle,
} from './ass-tag';

// Utilities
export { MAX_TAGS_PER_ARTICLE, MAX_TAG_LENGTH, slugify, canModifyTag } from './utils';

// Types
export type { TagWithCount } from './get-tag';
export type { Tag, NewTag } from '@/db/schema';
export type { TagWithOwnership } from './utils';
