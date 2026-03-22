'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArticleWithTags, getArticles, deleteArticle } from '@/actions/articles';
import { ArticleFilterBar } from './article-filter-bar';
import { ArticleStatusBadge } from './article-status-badge';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ArticlesListProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function ArticlesList({ searchParams }: ArticlesListProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [articles, setArticles] = useState<ArticleWithTags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<ArticleWithTags | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state from URL
  const search = (searchParams.search as string) || '';
  const status = (searchParams.status as string) || 'all';
  const tags = searchParams.tags ? (Array.isArray(searchParams.tags) ? searchParams.tags : [searchParams.tags]) : [];

  // Load on mount and when filters change
  useEffect(() => {
    loadArticles();
  }, []);

  // Load articles
  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getArticles();

      // Apply client-side filtering
      let filtered = data;

      if (search) {
        filtered = filtered.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));
      }

      if (status && status !== 'all') {
        filtered = filtered.filter((a) => a.status === status);
      }

      if (tags.length > 0) {
        filtered = filtered.filter((a) => tags.every((tag) => a.tags.includes(tag)));
      }

      setArticles(filtered);
    } catch (error) {
      toast.error('Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, tags]);

  const handleDelete = async () => {
    if (!articleToDelete) return;

    setIsDeleting(true);
    try {
      await deleteArticle(articleToDelete.id);
      toast.success('Article deleted successfully');
      await loadArticles();
    } catch (error) {
      toast.error('Failed to delete article');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const columns: ColumnDef<ArticleWithTags>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <div className="font-medium max-w-[300px] truncate">{row.getValue('title')}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <ArticleStatusBadge status={row.getValue('status')} />,
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => {
        const tags: string[] = row.getValue('tags');
        const visibleTags = tags.slice(0, 3);
        const remaining = tags.length - 3;

        return (
          <div className="flex flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {remaining > 0 && (
              <Badge variant="outline" className="text-xs">
                +{remaining}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date;
        return <div className="text-muted-foreground">{format(new Date(date), 'MMM d, yyyy')}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const article = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/articles/${article.id}`)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setArticleToDelete(article);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <ArticleFilterBar />

      <DataTable
        columns={columns}
        data={articles}
        onNewPlace={() => router.push('/articles/new')}
        newTitle="New Article"
        newButtonAllow={true}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{articleToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
