# Tasks: Refactor Articles Actions

## Phase 1: Foundation

- [ ] 1.1 Crear `src/actions/articles/utils.ts` - Types `ArticleWithTags`, `ArticleStats` y re-exports desde schema
- [ ] 1.2 Crear `src/actions/articles/get-article.ts` - 7 funciones READ: `getAllArticles`, `getArticleById`, `getArticlesByUserId`, `getArticlesByStatus`, `searchArticles`, `getArticleStats`, `getArticlesWithTags`
- [ ] 1.3 Crear `src/actions/articles/del-article.ts` - 2 funciones DELETE: `deleteArticle`, `deleteArticles`

## Phase 2: CREATE Operations

- [ ] 2.1 Crear `src/actions/articles/ins-article.ts` - Función base `insertArticle` con soporte de tags, importando `setArticleTags` desde `@/actions/tags/ass-tag` y `upsertTag` desde `@/actions/tags/ins-tag`
- [ ] 2.2 Migrar wrapper `createArticle` desde `articles-wrapper.ts` a `ins-article.ts` - Firma compatible: `createArticle(data, tagNames)` retornando `ArticleWithTags`

## Phase 3: UPDATE Operations

- [ ] 3.1 Crear `src/actions/articles/upd-article.ts` - 3 funciones UPDATE: `updateArticle`, `updateArticleStatus`, `upsertArticle`, importando `setArticleTags` desde `@/actions/tags/ass-tag`
- [ ] 3.2 Migrar wrapper `updateArticle` desde `articles-wrapper.ts` a `upd-article.ts` - Firma compatible: `updateArticle(id, data, tagNames)` retornando `ArticleWithTags`

## Phase 4: Integration

- [ ] 4.1 Actualizar `src/actions/articles/index.ts` - Reorganizar barrel exports por operaciones (READ, CREATE, UPDATE, DELETE, Utility), mantener compatibilidad hacia atrás con alias existentes
- [ ] 4.2 Eliminar `src/actions/articles/articles.ts` (610 líneas) y `src/actions/articles/articles-wrapper.ts` (74 líneas)

## Phase 5: Verification

- [ ] 5.1 Verificar build (`pnpm build`), TypeScript sin errores (`pnpm tsc --noEmit`), y funcionamiento de todas las operaciones CRUD + wrappers
