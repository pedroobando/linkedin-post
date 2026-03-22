'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore, checkForDraftRecovery } from '@/store/editor-store';
import { ArticleWithTags, ArticleStatus } from '@/actions/articles';
import { EnhancedTagInput } from './enhanced-tag-input';
import { LinkedInPreview } from './linkedin-preview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Save, 
  Eye, 
  Trash2, 
  RotateCcw, 
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Using SimpleTextEditor instead of RichTextEditor to avoid SSR issues with TipTap
import { SimpleTextEditor } from './simple-text-editor';

interface ArticleEditorProps {
  article?: ArticleWithTags | null;
  userId?: string;
}

/**
 * Article Editor Component
 * 
 * Main form wrapper for creating and editing articles.
 * 
 * Features:
 * - Title input (required, max 200)
 * - Summary textarea (optional, max 500)
 * - Rich text editor (TipTap)
 * - Tag selector with autocomplete
 * - Status selector
 * - Auto-save (every 30 seconds)
 * - localStorage backup
 * - LinkedIn preview
 * - Form validation
 */
export function ArticleEditor({ article, userId = 'default-user' }: ArticleEditorProps) {
  const router = useRouter();
  const {
    // State
    articleId,
    title,
    content,
    summary,
    tags,
    status,
    isDirty,
    isSaving,
    lastSaved,
    lastManualSave,
    hasRecoveredDraft,
    
    // Actions
    loadArticle,
    setTitle,
    setContent,
    setSummary,
    setTags,
    setStatus,
    reset,
    triggerAutoSave,
    markDraftRecovered,
    discardDraft,
    saveDraft,
    publish,
  } = useEditorStore();

  const [showPreview, setShowPreview] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Auto-save interval ref
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load article or check for draft recovery on mount
  useEffect(() => {
    if (article) {
      loadArticle(article);
    } else {
      // Check for draft recovery
      const { hasDraft, draft } = checkForDraftRecovery();
      if (hasDraft && draft) {
        // Only recover if we have some content
        if (draft.title || draft.content) {
          markDraftRecovered();
          toast.info('Recovered auto-saved draft', {
            description: 'Your previous work has been restored.',
            duration: 5000,
          });
        }
      }
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [article, loadArticle, markDraftRecovered]);

  // Setup auto-save interval
  useEffect(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    if (isDirty && title.trim()) {
      autoSaveIntervalRef.current = setInterval(() => {
        triggerAutoSave(userId);
        toast.success('Auto-saved', { duration: 2000 });
      }, 30000); // 30 seconds
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [isDirty, title, userId, triggerAutoSave]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length > 200) {
      errors.title = 'Title must be 200 characters or less';
    }

    if (summary && summary.length > 500) {
      errors.summary = 'Summary must be 500 characters or less';
    }

    const contentText = content.replace(/<[^>]*>/g, '');
    if (!contentText.trim()) {
      errors.content = 'Content is required';
    } else if (contentText.length > 3000) {
      errors.content = 'Content exceeds LinkedIn limit of 3000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, summary, content]);

  // Handle save draft
  const handleSaveDraft = async () => {
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      await saveDraft(userId);
      toast.success('Draft saved successfully');
      
      // Redirect to articles list if new article
      if (!article) {
        router.push('/articles');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save draft');
    }
  };

  // Handle publish
  const handlePublish = async () => {
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsPublishing(true);
    try {
      await publish(userId);
      toast.success('Article published successfully!');
      router.push('/articles');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle discard draft
  const handleDiscardDraft = () => {
    discardDraft();
    
    if (article) {
      // Reload original article
      loadArticle(article);
    } else {
      // Reset to empty
      reset();
    }
    
    setShowDiscardDialog(false);
    toast.info('Draft discarded');
  };

  // Status options
  const statusOptions: { value: ArticleStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
    { value: 'published', label: 'Published', color: 'bg-green-500' },
    { value: 'archived', label: 'Archived', color: 'bg-muted' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {article ? 'Edit Article' : 'New Article'}
          </h1>
          <p className="text-muted-foreground">
            {article ? 'Update your LinkedIn article' : 'Create a new LinkedIn article'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Save Status */}
          {isSaving ? (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          ) : lastSaved ? (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
            </Badge>
          ) : isDirty ? (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </Badge>
          ) : null}
          
          {/* Discard Draft Button */}
          {(isDirty || hasRecoveredDraft) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDiscardDialog(true)}
              className="text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Discard
            </Button>
          )}
        </div>
      </div>

      {/* Draft Recovery Alert */}
      {hasRecoveredDraft && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Draft Recovered</AlertTitle>
          <AlertDescription>
            We restored your previous work from auto-save. You can continue editing or discard this draft.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
        {/* Left Column - Main Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Article Content
              </CardTitle>
              <CardDescription>
                Write your LinkedIn post. Content will be formatted for LinkedIn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter article title..."
                  maxLength={200}
                  className={cn(validationErrors.title && 'border-destructive')}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{title.length} / 200</span>
                  {validationErrors.title && (
                    <span className="text-destructive">{validationErrors.title}</span>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <Label htmlFor="summary">Summary (Optional)</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary of your article..."
                  maxLength={500}
                  rows={3}
                  className={cn(validationErrors.summary && 'border-destructive')}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{summary.length} / 500</span>
                  {validationErrors.summary && (
                    <span className="text-destructive">{validationErrors.summary}</span>
                  )}
                </div>
              </div>

              {/* Article Content - Simple Text Editor */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Content <span className="text-destructive">*</span>
                </Label>
                <SimpleTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your article content here..."
                  className={cn(validationErrors.content && 'border-destructive')}
                />
                {validationErrors.content && (
                  <p className="text-sm text-destructive">{validationErrors.content}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                Add up to 10 tags to categorize your article
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedTagInput
                tags={tags}
                onTagsChange={setTags}
                placeholder="Type a tag and press Enter..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings & Actions */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Set the publishing status of your article
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={status} onValueChange={(v) => setStatus(v as ArticleStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', option.color)} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleSaveDraft} 
                disabled={isSaving}
                className="w-full"
                variant="outline"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </Button>
              
              <Button 
                onClick={() => setShowPreview(true)}
                variant="outline"
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              <Separator />
              
              <Button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full"
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {article?.status === 'published' ? 'Update' : 'Publish'}
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Keep content under 3,000 characters for LinkedIn</p>
              <p>• Use formatting sparingly (bold, lists)</p>
              <p>• Add relevant tags for discovery</p>
              <p>• Auto-save happens every 30 seconds</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* LinkedIn Preview Modal */}
      <LinkedInPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        content={content}
        tags={tags}
      />

      {/* Discard Dialog */}
      {showDiscardDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Discard Draft?</CardTitle>
              <CardDescription>
                This will discard all unsaved changes and load the last saved version.
                This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDiscardDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDiscardDraft}>
                <Trash2 className="h-4 w-4 mr-2" />
                Discard
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}