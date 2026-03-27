# Design: Refactor Articles Actions

## Technical Approach

Reorganizar las acciones de artículos siguiendo la convención estándar de `{op}-{entity}.ts` del proyecto. El archivo monolítico `articles.ts` (610 líneas) se dividirá en 5 archivos especializados, eliminando duplicaciones de código de tags y consolidando los wrappers en sus archivos de operación correspondientes.

## Architecture Decisions

### Decision 1: Eliminación de Duplicaciones de Tags

**Choice**: Importar funciones de `tags/` en lugar de duplicar código
**Alternatives considered**: Mantener helpers locales para "independencia"
**Rationale**: 
- DRY principle: `setArticleTags`, `upsertTagHelper` y `slugify` están duplicados
- Las operaciones de tags ya están centralizadas y probadas
- El acoplamiento temporal es aceptable - los artículos SIEMPRE usarán tags

### Decision 2: Wrappers en Archivos de Operación

**Choice**: `createArticle` e `updateArticle` (wrappers) se mueven a `ins-article.ts` y `upd-article.ts` respectivamente
**Alternatives considered**: Archivo separado `articles-wrapper.ts`
**Rationale**:
- Los wrappers son variaciones de las operaciones base
- Elimina la fragmentación entre operación y wrapper
- Permite eliminar `articles-wrapper.ts` completamente

### Decision 3: Barrel Export Organizado

**Choice**: Organizar exports por categoría funcional
**Alternatives considered**: Exportación plana alfabética
**Rationale**:
- Facilita descubrimiento de funciones relacionadas
- Mantiene aliases para compatibilidad hacia atrás
- Tipos re-exportados explícitamente

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/actions/articles/get-article.ts` | Create | 7 funciones READ: getAllArticles, getArticleById, getArticlesByUserId, getArticlesByStatus, searchArticles, getArticlesWithTags |
| `src/actions/articles/ins-article.ts` | Create | CREATE: insertArticle + wrapper createArticle |
| `src/actions/articles/upd-article.ts` | Create | UPDATE: updateArticle, updateArticleStatus + wrapper updateArticle |
| `src/actions/articles/del-article.ts` | Create | DELETE: deleteArticle, deleteArticles |
| `src/actions/articles/utils.ts` | Create | Types: ArticleWithTags, ArticleStats + re-exports |
| `src/actions/articles/index.ts` | Modify | Barrel export reorganizado por categoría |
| `src/actions/articles/articles.ts` | Delete | Reemplazado por archivos especializados |
| `src/actions/articles/articles-wrapper.ts` | Delete | Wrappers movidos a ins/up |

## Code Structure

### get-article.ts
```typescript
'use server';

import { db, eq, and, like, sql, or } from '@/db';
import { articles, tags, articleTags } from '@/db/schema';
import { Article, ArticleStatus } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';
import { ArticleWithTags } from './utils';

export const getAllArticles = async (): Promise<Article[]> => { ... }
export const getArticleById = async (id: string): Promise<ArticleWithTags | null> => { ... }
export const getArticlesByUserId = async (userId: string): Promise<Article[]> => { ... }
export const getArticlesByStatus = async (status: ArticleStatus): Promise<Article[]> => { ... }
export const searchArticles = async (query: string, limit?: number): Promise<Article[]> => { ... }
export const getArticlesWithTags = async (): Promise<ArticleWithTags[]> => { ... }
export const getArticleStats = async (): Promise<ArticleStats> => { ... }
```

### ins-article.ts
```typescript
'use server';

import { db } from '@/db';
import { articles, tags as tagsTable, articleTags } from '@/db/schema';
import { Article, NewArticle } from '@/db/schema';
import { tryCatch } from '@/utils';
import { setArticleTags } from '../tags/ass-tag';
import { ArticleWithTags } from './utils';
import { eq } from '@/db';

// Operación base
export const insertArticle = async (
  data: NewArticle & { tagNames?: string[] }
): Promise<Article> => { ... }

// Wrapper con firma compatible
export const createArticle = async (
  data: NewArticle,
  tagNames?: string[]
): Promise<ArticleWithTags> => { ... }
```

### upd-article.ts
```typescript
'use server';

import { db, eq } from '@/db';
import { articles, tags as tagsTable, articleTags } from '@/db/schema';
import { Article, NewArticle, ArticleStatus } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';
import { setArticleTags } from '../tags/ass-tag';
import { ArticleWithTags } from './utils';

// Operaciones base
export const updateArticle = async (
  id: string,
  data: Partial<NewArticle> & { tagNames?: string[] }
): Promise<Article> => { ... }

export const updateArticleStatus = async (
  id: string,
  status: ArticleStatus
): Promise<Article> => { ... }

// Wrapper con firma compatible
export const updateArticleWithTags = async (
  id: string,
  data: Partial<NewArticle> & { status?: ArticleStatus; publishedAt?: Date | null },
  tagNames?: string[]
): Promise<ArticleWithTags> => { ... }
```

### del-article.ts
```typescript
'use server';

import { db, eq, inArray } from '@/db';
import { articles } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';

export const deleteArticle = async (id: string): Promise<void> => { ... }
export const deleteArticles = async (ids: string[]): Promise<void> => { ... }
```

### utils.ts
```typescript
import { Article, ArticleStatus } from '@/db/schema';

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

// Re-exports for convenience
export type { Article, NewArticle, ArticleStatus } from '@/db/schema';
```

### index.ts (Barrel)
```typescript
// READ operations
export {
  getAllArticles as getArticles,
  getArticleById,
  getArticlesByUserId as getArticlesByUser,
  getArticlesByStatus,
  searchArticles,
  getArticlesWithTags,
  getArticleStats,
} from './get-article';

// CREATE operations
export { insertArticle, createArticle } from './ins-article';

// UPDATE operations
export {
  updateArticle,
  updateArticleStatus,
  updateArticleWithTags as updateArticleWithTags, // alias consistente
} from './upd-article';

// DELETE operations
export { deleteArticle, deleteArticles } from './del-article';

// Types
export type { ArticleWithTags, ArticleStats, Article, NewArticle, ArticleStatus } from './utils';
```

## Import Dependencies

```
articles/
├── get-article.ts  →  @/db, @/db/schema, @/utils, ./utils
├── ins-article.ts  →  @/db, @/db/schema, @/utils, ../tags/ass-tag, ./utils
├── upd-article.ts  →  @/db, @/db/schema, @/utils, ../tags/ass-tag, ./utils
├── del-article.ts  →  @/db, @/db/schema, @/utils
├── utils.ts        →  @/db/schema
└── index.ts        →  ./* (all local modules)
```

## Entry Point Verification

`src/actions/index.ts` ya exporta desde `articles/`:
```typescript
export * from './articles';
```

El barrel export mantendrá todas las exportaciones actuales, garantizando compatibilidad hacia atrás.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Cada función en archivos separados | Verificar imports correctos, validación UUID |
| Integration | Flujo completo CRUD con tags | Crear artículo → actualizar → eliminar |
| Regression | Barrel exports | Verificar que todas las funciones estén disponibles |

## Migration / Rollout

No migration required. El refactoring es transparente:
1. Crear nuevos archivos
2. Actualizar barrel export
3. Eliminar archivos viejos
4. Verificar que `src/actions/index.ts` siga funcionando

## Open Questions

- [ ] ¿Renombrar `updateArticleWithTags` a `updateArticle` en el barrel para mantener compatibilidad exacta?
- [ ] ¿Mover `upsertArticle` a un archivo separado o incluirlo en `ins-article.ts`?
