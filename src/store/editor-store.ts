/**
 * Editor Store (Zustand)
 * 
 * Manages editor state including:
 * - Content, dirty state, saving state
 * - Auto-save functionality
 * - localStorage backup for draft recovery
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createArticle, updateArticle, ArticleWithTags, ArticleStatus } from '@/actions';

export interface EditorState {
  // Article data
  articleId: string | null;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  status: ArticleStatus;
  
  // Editor state
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  lastManualSave: Date | null;
  autoSaveError: string | null;
  
  // Draft recovery
  hasRecoveredDraft: boolean;
  
  // Actions
  setArticleId: (id: string | null) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setSummary: (summary: string) => void;
  setTags: (tags: string[]) => void;
  setStatus: (status: ArticleStatus) => void;
  
  // Load existing article
  loadArticle: (article: ArticleWithTags) => void;
  
  // Reset
  reset: () => void;
  clearDirtyState: () => void;
  markAsSaved: () => void;
  
  // Auto-save
  triggerAutoSave: (userId: string) => Promise<void>;
  
  // Draft recovery
  markDraftRecovered: () => void;
  discardDraft: () => void;
  
  // Manual save
  saveDraft: (userId: string) => Promise<ArticleWithTags | null>;
  publish: (userId: string) => Promise<ArticleWithTags | null>;
}

const initialState = {
  articleId: null,
  title: '',
  content: '',
  summary: '',
  tags: [],
  status: 'draft' as ArticleStatus,
  isDirty: false,
  isSaving: false,
  lastSaved: null,
  lastManualSave: null,
  autoSaveError: null,
  hasRecoveredDraft: false,
};

// Storage key for localStorage backup
const DRAFT_STORAGE_KEY = 'article-editor-draft';

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setArticleId: (id) => set({ articleId: id }),
      
      setTitle: (title) => set({ 
        title, 
        isDirty: true,
        lastSaved: null 
      }),
      
      setContent: (content) => set({ 
        content, 
        isDirty: true,
        lastSaved: null 
      }),
      
      setSummary: (summary) => set({ 
        summary, 
        isDirty: true,
        lastSaved: null 
      }),
      
      setTags: (tags) => set({ 
        tags, 
        isDirty: true,
        lastSaved: null 
      }),
      
      setStatus: (status) => set({ 
        status, 
        isDirty: true,
        lastSaved: null 
      }),
      
      loadArticle: (article) => set({
        articleId: article.id,
        title: article.title,
        content: article.content,
        summary: article.summary || '',
        tags: article.tags,
        status: article.status,
        isDirty: false,
        isSaving: false,
        lastSaved: new Date(),
        lastManualSave: new Date(),
        autoSaveError: null,
        hasRecoveredDraft: false,
      }),
      
      reset: () => {
        // Clear localStorage backup
        if (typeof window !== 'undefined') {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
        set(initialState);
      },
      
      clearDirtyState: () => set({ isDirty: false }),
      
      markAsSaved: () => set({ 
        isDirty: false, 
        isSaving: false,
        lastSaved: new Date() 
      }),
      
      triggerAutoSave: async (userId: string) => {
        const state = get();
        
        // Don't auto-save if not dirty or already saving
        if (!state.isDirty || state.isSaving) return;
        
        // Don't auto-save if title is empty
        if (!state.title.trim()) return;
        
        set({ isSaving: true, autoSaveError: null });
        
        try {
          let result: ArticleWithTags;
          
          if (state.articleId) {
            // Update existing article
            result = await updateArticle(state.articleId, {
              title: state.title,
              content: state.content,
              summary: state.summary || null,
              status: state.status,
            }, state.tags);
          } else {
            // Create new article
            result = await createArticle({
              userId,
              title: state.title,
              content: state.content,
              summary: state.summary || null,
              status: state.status,
            }, state.tags);
          }
          
          // Update article ID if it was a new article
          if (!state.articleId) {
            set({ articleId: result.id });
          }
          
          // Clear localStorage backup after successful auto-save
          if (typeof window !== 'undefined') {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
          }
          
          set({ 
            isSaving: false, 
            isDirty: false,
            lastSaved: new Date() 
          });
        } catch (error) {
          set({ 
            isSaving: false, 
            autoSaveError: error instanceof Error ? error.message : 'Auto-save failed'
          });
          
          // Save to localStorage as backup
          if (typeof window !== 'undefined') {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
              title: state.title,
              content: state.content,
              summary: state.summary,
              tags: state.tags,
              status: state.status,
              timestamp: new Date().toISOString(),
            }));
          }
        }
      },
      
      markDraftRecovered: () => set({ hasRecoveredDraft: true }),
      
      discardDraft: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
        set({ hasRecoveredDraft: false });
      },
      
      saveDraft: async (userId: string) => {
        const state = get();
        
        if (!state.title.trim()) {
          throw new Error('Title is required');
        }
        
        set({ isSaving: true, autoSaveError: null });
        
        try {
          let result: ArticleWithTags;
          
          if (state.articleId) {
            result = await updateArticle(state.articleId, {
              title: state.title,
              content: state.content,
              summary: state.summary || null,
              status: 'draft',
            }, state.tags);
          } else {
            result = await createArticle({
              userId,
              title: state.title,
              content: state.content,
              summary: state.summary || null,
              status: 'draft',
            }, state.tags);
          }
          
          // Clear localStorage backup
          if (typeof window !== 'undefined') {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
          }
          
          set({ 
            articleId: result.id,
            isSaving: false, 
            isDirty: false,
            lastSaved: new Date(),
            lastManualSave: new Date(),
            status: 'draft',
          });
          
          return result;
        } catch (error) {
          set({ 
            isSaving: false, 
            autoSaveError: error instanceof Error ? error.message : 'Save failed'
          });
          throw error;
        }
      },
      
      publish: async (userId: string) => {
        const state = get();
        
        if (!state.title.trim()) {
          throw new Error('Title is required');
        }
        
        if (!state.content.trim()) {
          throw new Error('Content is required');
        }
        
        set({ isSaving: true, autoSaveError: null });
        
        try {
          let result: ArticleWithTags;
          
          const publishData = {
            title: state.title,
            content: state.content,
            summary: state.summary || null,
            status: 'published' as ArticleStatus,
            publishedAt: new Date(),
          };
          
          if (state.articleId) {
            result = await updateArticle(state.articleId, publishData, state.tags);
          } else {
            result = await createArticle({
              userId,
              ...publishData,
            }, state.tags);
          }
          
          // Clear localStorage backup
          if (typeof window !== 'undefined') {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
          }
          
          set({ 
            articleId: result.id,
            isSaving: false, 
            isDirty: false,
            lastSaved: new Date(),
            lastManualSave: new Date(),
            status: 'published',
          });
          
          return result;
        } catch (error) {
          set({ 
            isSaving: false, 
            autoSaveError: error instanceof Error ? error.message : 'Publish failed'
          });
          throw error;
        }
      },
    }),
    {
      name: 'editor-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields for draft recovery
        title: state.title,
        content: state.content,
        summary: state.summary,
        tags: state.tags,
        status: state.status,
        articleId: state.articleId,
      }),
    }
  )
);

/**
 * Check if there's a recovered draft in localStorage
 * Call this on editor mount to check for recovery
 */
export function checkForDraftRecovery(): {
  hasDraft: boolean;
  draft: Partial<EditorState> | null;
} {
  if (typeof window === 'undefined') {
    return { hasDraft: false, draft: null };
  }
  
  const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!saved) {
    return { hasDraft: false, draft: null };
  }
  
  try {
    const draft = JSON.parse(saved);
    return { hasDraft: true, draft };
  } catch {
    return { hasDraft: false, draft: null };
  }
}

/**
 * Clear the draft from localStorage
 */
export function clearDraftBackup(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  }
}