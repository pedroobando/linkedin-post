import { ArticleEditorWrapper } from '@/components/editor/article-editor-wrapper';

/**
 * New Article Page
 * 
 * Creates a new article with an empty editor form.
 * The editor handles:
 * - Form state management
 * - Auto-save (every 30 seconds)
 * - Draft recovery from localStorage
 * - Validation
 */
export default function NewArticlePage() {
  return <ArticleEditorWrapper />;
}
