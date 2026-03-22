import { notFound } from 'next/navigation';
import { getArticleById } from '@/actions/articles';
import { ArticleEditorWrapper } from '@/components/editor/article-editor-wrapper';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit Article Page
 * 
 * Loads an existing article and displays the editor form.
 * Server-side fetches the article by ID and 404s if not found.
 * 
 * Features:
 * - Server-side article fetching
 * - 404 handling for non-existent articles
 * - Editor form with pre-filled data
 * - Auto-save support
 */
export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  return <ArticleEditorWrapper article={article} />;
}
