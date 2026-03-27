# Tasks: Standardize Server Actions

## Phase 1: Articles Foundation

### 1.1 Crear `articles/utils.ts`
- [ ] Copiar `slugify()` de `articles.ts` (líneas 601-608)
- [ ] Mover `setArticleTags()` helper (líneas 501-547)
- [ ] Mover `upsertTagHelper()` helper (líneas 554-594)
- [ ] Extraer tipos: `ArticleWithTags`, `ArticleStats` (líneas 17-27)
- [ ] Agregar `'use server'` en la primera línea
- [ ] Verificar: usar `tryCatch` desde `@/utils`
- [ ] Verificar: mensajes de error en español

### 1.2 Crear `articles/get-article.ts`
- [ ] Agregar `'use server'` en la primera línea
- [ ] Implementar `getAllArticles()` (líneas 40-51 de articles.ts)
- [ ] Implementar `getArticleById()` (líneas 58-95)
- [ ] Implementar `getArticlesByUserId()` (líneas 102-121)
- [ ] Implementar `getArticlesByStatus()` (líneas 128-143)
- [ ] Implementar `searchArticles()` (líneas 151-175)
- [ ] Implementar `getArticlesWithTags()` (líneas 445-489)
- [ ] Implementar `getArticleStats()` (líneas 398-439)
- [ ] Importar helpers desde `./utils`
- [ ] Re-exportar tipos necesarios

### 1.3 Crear `articles/ins-article.ts`
- [ ] Agregar `'use server'` en la primera línea
- [ ] Implementar `insertArticle()` (líneas 186-215 de articles.ts)
- [ ] Importar `setArticleTags` desde `./utils`
- [ ] Preservar firma: `insertArticle(data: NewArticle & { tagNames?: string[] })`
- [ ] Verificar uso de `tryCatch` y mensajes en español

### 1.4 Crear `articles/upd-article.ts`
- [ ] Agregar `'use server'` en la primera línea
- [ ] Implementar `updateArticle()` (líneas 223-261 de articles.ts)
- [ ] Implementar `updateArticleStatus()` (líneas 269-305)
- [ ] Implementar `upsertArticle()` (líneas 312-341)
- [ ] Importar `insertArticle` desde `./ins-article`
- [ ] Importar `setArticleTags` desde `./utils`
- [ ] Preservar firma de `updateArticle` compatible con editor-store

### 1.5 Crear `articles/del-article.ts`
- [ ] Agregar `'use server'` en la primera línea
- [ ] Implementar `deleteArticle()` (líneas 352-365 de articles.ts)
- [ ] Implementar `deleteArticles()` (líneas 372-388)
- [ ] Verificar validación de UUID en ambas funciones
- [ ] Verificar uso de `inArray` para múltiples IDs

## Phase 2: Articles Integration

### 1.6 Actualizar `articles/index.ts` (barrel)
- [ ] Limpiar exports: remover referencias a `articles.ts` y `articles-wrapper.ts`
- [ ] Re-exportar desde `./get-article`: `getArticles`, `getArticleById`, `getArticlesByUser`, `getArticlesByStatus`, `searchArticles`, `getArticlesWithTags`, `getArticleStats`
- [ ] Re-exportar desde `./ins-article`: `insertArticle`
- [ ] Re-exportar desde `./upd-article`: `updateArticle`, `updateArticleStatus`, `upsertArticle`
- [ ] Re-exportar desde `./del-article`: `deleteArticle`, `deleteArticles`
- [ ] Re-exportar tipos: `ArticleWithTags`, `ArticleStats` desde `./utils`
- [ ] Crear `createArticle` wrapper con firma `(data, tagNames?)` usando `insertArticle`
- [ ] Crear `updateArticle` wrapper con firma `(id, data, tagNames?)` usando `updateArticle` de upd-article.ts
- [ ] Asegurar que wrappers devuelven `ArticleWithTags` (fetch tags después de operación)

### 1.7 Eliminar archivos obsoletos
- [ ] Eliminar `src/actions/articles/articles.ts` (610 líneas)
- [ ] Eliminar `src/actions/articles/articles-wrapper.ts` (74 líneas)
- [ ] Verificar que no queden imports rotos en otros archivos
- [ ] Verificar barrel export funciona correctamente

## Phase 3: Users Standardization

### 1.8 Renombrar `set-user-role.ts` → `upd-user.ts`
- [ ] Renombrar archivo: `src/actions/users/set-user-role.ts` → `src/actions/users/upd-user.ts`
- [ ] Renombrar función exportada: `setUserRole` → `updateUser` (o `updUser`)
- [ ] Actualizar imports en `src/actions/index.ts`: cambiar `setUserRole` por nuevo nombre
- [ ] Mantener firma y lógica exacta: `({ userId, isActive }: Props) => Promise<IUser>`
- [ ] Preservar `'use server'` en primera línea

### 1.9 Crear `users/index.ts` (barrel)
- [ ] Crear archivo nuevo: `src/actions/users/index.ts`
- [ ] Re-exportar desde `./get-user`: `getUsersAll`, `getUserbyEmail`, `getUserbyId`, `getUsersPage`
- [ ] Re-exportar desde `./upd-user`: `updateUser` (o `updUser`)
- [ ] Re-exportar tipos si es necesario desde `@/db/schema`
- [ ] Organizar exports por categorías: READ, UPDATE

## Phase 4: Entry Point Update

### 1.10 Actualizar `src/actions/index.ts`
- [ ] Actualizar import de users: cambiar `@/actions/users/set-user-role` a `@/actions/users`
- [ ] Actualizar export de función de usuario: `setUserRole` → `updateUser` (o `updUser`)
- [ ] Verificar exports de articles aún funcionan (ahora vienen del barrel actualizado)
- [ ] Verificar exports de tags sin cambios
- [ ] Verificar exports de auth sin cambios
- [ ] Verificar exports de minio sin cambios

## Phase 5: Verification

### 1.11 Verificar build y TypeScript
- [ ] Ejecutar `pnpm tsc --noEmit` y verificar 0 errores
- [ ] Ejecutar `pnpm build` y verificar build exitoso
- [ ] Verificar no hay errores de linting: `pnpm lint`

### 1.12 Verificar imports en consumidores
- [ ] Buscar todos los imports de `@/actions/articles` en el codebase
- [ ] Verificar que `getArticles`, `getArticleById`, etc. siguen disponibles
- [ ] Buscar todos los imports de `setUserRole` y actualizar si es necesario
- [ ] Verificar componentes cliente pueden importar desde `@/actions` sin errores
- [ ] Verificar que barrel exports no incluyen `db` directamente (solo re-exports de archivos con 'use server')
