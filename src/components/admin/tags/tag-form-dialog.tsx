'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagWithCount } from './tags-list';
import { upsertTag, updateTag } from '@/actions/tags';
import { slugify } from '@/actions/tags/utils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface TagFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  tag?: TagWithCount;
  onSuccess: () => void;
}

export function TagFormDialog({
  open,
  onOpenChange,
  mode,
  tag,
  onSuccess,
}: TagFormDialogProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && tag) {
        setName(tag.name);
        setSlug(tag.slug);
      } else {
        setName('');
        setSlug('');
      }
      setError(null);
    }
  }, [open, mode, tag]);

  // Update slug preview when name changes
  useEffect(() => {
    if (name) {
      setSlug(slugify(name));
    } else {
      setSlug('');
    }
  }, [name]);

  const validate = (): boolean => {
    const trimmed = name.trim();
    
    if (!trimmed) {
      setError('Tag name is required');
      return false;
    }
    
    if (trimmed.length > 50) {
      setError('Tag name must be 50 characters or less');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'edit' && tag) {
        await updateTag(tag.id, name);
        toast.success(`Tag "${name}" updated successfully`);
      } else {
        await upsertTag(name);
        toast.success(`Tag "${name}" created successfully`);
      }
      
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create New Tag' : 'Edit Tag'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tag name..."
                disabled={isSubmitting}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {name.length}/50 characters
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug Preview</Label>
              <code className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1.5 rounded block">
                {slug || 'tag-slug-preview'}
              </code>
              <p className="text-xs text-muted-foreground">
                Auto-generated from name
              </p>
            </div>
            
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
