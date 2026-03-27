export { signInAction } from '@/actions/auth/signin-action';
export { signOutAction } from '@/actions/auth/signout-action';
export { changePassAction } from '@/actions/auth/change-pass';
export { signUpAction } from '@/actions/auth/signup-action';

//INFO: MinIO Server Actions
export { createBucket } from '@/actions/minio/create-bucket';
export { dnloadFileFromR2 } from '@/actions/minio/download-file';
export { delFileFromR2 } from '@/actions/minio/remove-file';
export { uploadFileToR2 } from '@/actions/minio/upload-file';

//INFO: Users Server Action
export { getUsersAll, getUserbyEmail, getUserbyId, getUsersPage } from '@/actions/users/get-user';
export { setUserRole } from '@/actions/users/set-user-role';

//INFO: Articles Server Actions
// READ Operations
export {
  getAllArticles as getArticles,
  getArticleById,
  getArticlesByUserId as getArticlesByUser,
  getArticlesByStatus,
  searchArticles,
  getArticlesWithTags,
  getArticleStats,
} from '@/actions/articles/get-article';

// CREATE Operations
export { insertArticle, createArticle } from '@/actions/articles/ins-article';

// UPDATE Operations
export { updateArticleWithTags as updateArticle, updateArticleStatus, upsertArticle } from '@/actions/articles/upd-article';

// DELETE Operations
export { deleteArticle, deleteArticles } from '@/actions/articles/del-article';

// Types
export type { ArticleWithTags, ArticleStats } from '@/actions/articles/utils';
export type { Article, NewArticle, ArticleStatus } from '@/db/schema';

//INFO: Tags Server Actions
export {
  // Create
  upsertTag,
  // Read
  getTagById,
  getAllTags,
  getAllTagsWithCount,
  searchTags,
  // Update
  updateTag,
  // Delete
  deleteTag,
  deleteTags,
  deleteOrphanedTags,
  // Admin
  canDeleteTag,
  getTagStats,
  // Article associations
  getArticleTags,
  getArticleTagObjects,
  setArticleTags,
  addTagToArticle,
  removeTagFromArticle,
} from '@/actions/tags';

//INFO: Tags Types
export type { Tag, TagWithCount, NewTag } from '@/actions/tags';
