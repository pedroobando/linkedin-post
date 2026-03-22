import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ArticleStatus = 'all' | 'draft' | 'scheduled' | 'published' | 'archived';
export type SortBy = 'createdAt' | 'updatedAt' | 'title';
export type SortOrder = 'asc' | 'desc';

interface ArticleFilterState {
  // Filter values
  search: string;
  status: ArticleStatus;
  tags: string[];
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: SortBy;
  sortOrder: SortOrder;
  
  // Actions
  setSearch: (search: string) => void;
  setStatus: (status: ArticleStatus) => void;
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setDateFrom: (date: Date | undefined) => void;
  setDateTo: (date: Date | undefined) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  resetFilters: () => void;
  
  // Pagination
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

const initialState = {
  search: '',
  status: 'all' as ArticleStatus,
  tags: [],
  dateFrom: undefined,
  dateTo: undefined,
  sortBy: 'createdAt' as SortBy,
  sortOrder: 'desc' as SortOrder,
  page: 1,
  pageSize: 25,
};

export const useArticleFilterStore = create<ArticleFilterState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setSearch: (search) => set({ search, page: 1 }),
      
      setStatus: (status) => set({ status, page: 1 }),
      
      setTags: (tags) => set({ tags, page: 1 }),
      
      addTag: (tag) => set((state) => ({
        tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag],
        page: 1,
      })),
      
      removeTag: (tag) => set((state) => ({
        tags: state.tags.filter((t) => t !== tag),
        page: 1,
      })),
      
      setDateFrom: (dateFrom) => set({ dateFrom, page: 1 }),
      
      setDateTo: (dateTo) => set({ dateTo, page: 1 }),
      
      setSortBy: (sortBy) => set({ sortBy }),
      
      setSortOrder: (sortOrder) => set({ sortOrder }),
      
      resetFilters: () => set({ ...initialState }),
      
      setPage: (page) => set({ page }),
      
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
    }),
    {
      name: 'article-filter-storage',
      partialize: (state) => ({
        pageSize: state.pageSize,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
