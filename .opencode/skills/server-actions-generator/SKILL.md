---
name: server-actions-generator
description: Generate Next.js 15+ Server Actions following the project's established patterns with Drizzle ORM, tryCatch error handling, and proper TypeScript typing. Use when the user wants to create, generate, or scaffold server actions for database operations (CRUD), authentication, file uploads, or any server-side logic. Triggers on phrases like "create server action", "generate action", "scaffold actions", "make a server action", or any request involving actions/ with database operations.
---

# Server Actions Generator

Generate Next.js 15+ Server Actions following this project's specific conventions and patterns.

## Quick Reference

Every server action file MUST start with:
```typescript
'use server';
```

## File Organization Patterns (Updated Convention)

Organize actions by **domain/feature** in `src/actions/<domain>/` following the CRUD operation naming convention:

### For Domain Entities (Standard Pattern)

```
src/actions/
├── tags/                 # Tag domain - REFERENCE IMPLEMENTATION
│   ├── get-tag.ts       # READ operations (getAllTags, getTagById, etc.)
│   ├── ins-tag.ts       # CREATE/UPSERT operations (upsertTag)
│   ├── upd-tag.ts       # UPDATE operations (updateTag)
│   ├── del-tag.ts       # DELETE operations (deleteTag, deleteTags, etc.)
│   ├── ass-tag.ts       # ASSOCIATION operations (article-tag relations)
│   ├── utils.ts         # Shared helpers (slugify, constants)
│   └── index.ts         # Barrel exports
│
├── articles/            # Article domain
│   ├── get-article.ts   # READ operations
│   ├── ins-article.ts   # CREATE operations
│   ├── upd-article.ts   # UPDATE operations
│   ├── del-article.ts   # DELETE operations
│   ├── utils.ts         # Helpers and types
│   └── index.ts         # Barrel exports
│
├── users/               # User domain
│   ├── get-user.ts      # READ operations
│   ├── upd-user.ts      # UPDATE operations
│   └── index.ts         # Barrel exports
│
└── index.ts             # Root barrel exports
```

### Naming Convention (REQUIRED)

**Files:** `{operation}-{entity}.ts` where operation is:
- `get-{entity}.ts` - READ operations (list, get by id, search, etc.)
- `ins-{entity}.ts` - CREATE/UPSERT operations (insert, create, upsert)
- `upd-{entity}.ts` - UPDATE operations (update, modify, set)
- `del-{entity}.ts` - DELETE operations (delete, remove)
- `ass-{entity}.ts` - ASSOCIATION operations (many-to-many relations)
- `utils.ts` - Shared helpers, types, constants (optional)
- `index.ts` - Barrel exports (REQUIRED)

**Functions:** Use descriptive names with entity prefix:
- `get{Entity}All`, `get{Entity}ById`, `get{Entity}By{Field}`
- `ins{Entity}`, `create{Entity}`, `upsert{Entity}`
- `upd{Entity}`, `update{Entity}`, `set{Entity}{Field}`
- `del{Entity}`, `delete{Entity}`, `remove{Entity}`
- `get{EntityA}{EntityB}s`, `add{EntityA}To{EntityB}`, `set{EntityA}{EntityB}s`

### For Special Operations (Auth, File Storage)

Keep descriptive names for non-CRUD operations:

```
src/actions/
├── auth/                # Authentication
│   ├── signup-action.ts
│   ├── signin-action.ts
│   ├── signout-action.ts
│   └── change-pass.ts
│
└── minio/               # File storage
    ├── upload-file.ts
    ├── download-file.ts
    ├── remove-file.ts
    └── create-bucket.ts
```

## Required Imports

### Standard Pattern (Database Actions)
```typescript
import { count, db, eq, and, like, sql } from '@/db';
import { tags, articleTags } from '@/db/schema';
import { Tag } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';
```

### Importing from Other Action Modules
```typescript
// When one action needs another (e.g., associations need insert)
import { upsertTag } from './ins-tag';
import { slugify } from './utils';
```

### Auth Pattern
```typescript
import { auth } from '@/lib/auth';
import { tryCatch } from '@/utils';
import { headers } from 'next/headers';
import { getServerSession } from '@/lib/get-session';
```

### File Storage Pattern
```typescript
import { unicName, tryCatch } from '@/utils';
import { getMinioClient } from '@/lib/minio-client';
import { createBucket } from '@/actions/minio/create-bucket';
```

## Error Handling with tryCatch

This project uses a custom `tryCatch` utility that returns a tuple:

```typescript
// From src/utils/tryCatch.ts
type Result<T, E = Error> = readonly [T, null] | readonly [null, E];

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return [data, null] as const;
  } catch (error) {
    return [null, error as E] as const;
  }
}
```

**Usage pattern - always destructure:**
```typescript
const [dataResult, errResult] = await tryCatch(
  db.select().from(tagSchema)
);

if (errResult && !dataResult) {
  console.error(errResult.message);
  throw new Error('Error no controlado buscando las etiquetas, favor verificar.');
}
```

## File Structure Template

### get-{entity}.ts (READ Operations)
```typescript
/**
 * {Entity} Read Operations
 * Server actions for reading and querying {entities}.
 */

'use server';

import { db, eq, count, like, sql } from '@/db';
import { {entities} } from '@/db/schema';
import { {Entity} } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';

/**
 * {Entity} with additional computed fields
 */
export interface {Entity}WithCount extends {Entity} {
  count: number;
}

/**
 * Get all {entities} ordered by name.
 * @returns Array of all {entities}
 */
export const getAll{Entities} = async (): Promise<{Entity}[]> => {
  const [data, err] = await tryCatch(
    db.select().from({entities}).orderBy({entities}.name)
  );

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando los {entities}, favor verificar.');
  }

  return data as {Entity}[];
};

/**
 * Get a {entity} by its ID.
 * @param id - The {entity} ID
 * @returns The {entity} or null if not found
 */
export const get{Entity}ById = async (id: string): Promise<{Entity} | null> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ID ${id}, no es valido, favor verificar.`);
  }

  const [data, err] = await tryCatch(
    db.select().from({entities}).where(eq({entities}.id, id)).limit(1)
  );

  if (err && !data) {
    console.error(err.message);
    throw new Error('Error no controlado buscando el {entity}, favor verificar.');
  }

  return data && data.length > 0 ? (data[0] as {Entity}) : null;
};
```

### ins-{entity}.ts (CREATE Operations)
```typescript
/**
 * {Entity} Create Operations
 * Server actions for creating {entities}.
 */

'use server';

import { db } from '@/db';
import { {entities} } from '@/db/schema';
import { tryCatch } from '@/utils';
import { slugify } from './utils';

/**
 * Create a new {entity} or update existing if name already exists.
 * @param data - {Entity} name (string) or {entity} data to insert
 * @returns The created or existing {entity}
 */
export const upsert{Entity} = async (
  data: string | { name: string; slug?: string }
): Promise<{Entity}> => {
  // Implementation
};
```

### upd-{entity}.ts (UPDATE Operations)
```typescript
/**
 * {Entity} Update Operations
 * Server actions for updating {entities}.
 */

'use server';

import { db, eq } from '@/db';
import { {entities} } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';

/**
 * Update an existing {entity}.
 * @param id - The {entity} ID
 * @param data - Partial {entity} data to update
 * @returns The updated {entity}
 */
export const update{Entity} = async (
  id: string,
  data: Partial<{Entity}>
): Promise<{Entity}> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ID ${id}, no es valido, favor verificar.`);
  }

  const [dataResult, errResult] = await tryCatch(
    db.update({entities}).set(data).where(eq({entities}.id, id)).returning()
  );

  if (!dataResult && errResult) {
    console.error(errResult.message);
    throw new Error('Error no controlado actualizando el {entity}, favor verificar.');
  }

  if (!dataResult || dataResult.length === 0) {
    throw new Error('{Entity} no encontrado');
  }

  return dataResult[0] as {Entity};
};
```

### del-{entity}.ts (DELETE Operations)
```typescript
/**
 * {Entity} Delete Operations
 * Server actions for deleting {entities}.
 */

'use server';

import { db, eq, inArray } from '@/db';
import { {entities} } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';

/**
 * Delete a {entity} by ID.
 * @param id - The {entity} ID
 */
export const delete{Entity} = async (id: string): Promise<void> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ID ${id}, no es valido, favor verificar.`);
  }

  const [_, err] = await tryCatch(
    db.delete({entities}).where(eq({entities}.id, id))
  );

  if (err) {
    console.error(err.message);
    throw new Error('Error no controlado eliminando el {entity}, favor verificar.');
  }
};
```

### ass-{entity}.ts (ASSOCIATION Operations)
```typescript
/**
 * {Entity} Association Operations
 * Server actions for {entity}-{otherEntity} relationships.
 */

'use server';

import { db, eq, and } from '@/db';
import { {entityOther}s } from '@/db/schema';
import { tryCatch, isValidUUID } from '@/utils';
import { upsert{Entity} } from './ins-{entity}';

/**
 * Get all {entities} associated with a {otherEntity}.
 * @param {otherEntity}Id - The {otherEntity} ID
 * @returns Array of {entity} names
 */
export const get{OtherEntity}{Entities} = async ({otherEntity}Id: string): Promise<string[]> => {
  // Implementation
};
```

### utils.ts (Shared Helpers)
```typescript
/**
 * {Entity} Utilities
 * Shared helpers and constants for {entity} operations.
 */

/**
 * Maximum {entities} per {otherEntity}
 */
export const MAX_{ENTITIES}_PER_{OTHER_ENTITY} = 10;

/**
 * Maximum {entity} name length
 */
export const MAX_{ENTITY}_LENGTH = 50;

/**
 * Convert a string to a URL-friendly slug.
 * @param text - The text to convert
 * @returns The slugified text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove special characters
    .replace(/[\s_-]+/g, '-')      // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}
```

### index.ts (Barrel Exports)
```typescript
/**
 * {Entity} Actions - Barrel Export
 * Re-exporta todas las funciones de {entities} con nombres consistentes.
 */

// READ Operations
export {
  getAll{Entities},
  get{Entity}ById,
  get{Entity}BySlug,
  search{Entities},
} from './get-{entity}';

// CREATE Operations
export { upsert{Entity} } from './ins-{entity}';

// UPDATE Operations
export { update{Entity} } from './upd-{entity}';

// DELETE Operations
export {
  delete{Entity},
  delete{Entities},
} from './del-{entity}';

// Association Operations (if applicable)
export {
  get{OtherEntity}{Entities},
  add{Entity}To{OtherEntity},
} from './ass-{entity}';

// Utilities
export { slugify } from './utils';

// Types
export type { {Entity}WithCount } from './get-{entity}';
export type { {Entity}, New{Entity} } from '@/db/schema';
```

## Return Type Patterns

### Pattern 1: Direct Return with Error Throwing (Most Common)
For simple CRUD operations that either succeed or throw:

```typescript
export const get{Entity}All = async (): Promise<I{Entity}[]> => {
  const [data, err] = await tryCatch(
    db.select().from({entity}Schema).orderBy({entity}Schema.name)
  );

  if (err && !data) {
    throw new Error('Error no controlado buscando los {entities}, favor verificar.');
  }

  return data.map((item) => item as I{Entity});
};
```

### Pattern 2: Pagination Return
For paginated list operations:

```typescript
export const get{Entity}Page = async (options: PaginationOptions): Promise<{ totPage: number; data: I{Entity}[] }> => {
  const { page = 1, take = 12 } = options;
  const validPage = Math.max(1, Math.floor(page));
  const validTake = Math.max(1, Math.min(Math.floor(take), 100));
  const offset = (validPage - 1) * validTake;

  // Parallel queries for count and data
  const conditionTotal = db.select({ count: count() }).from({entity}Schema);
  const condition = db.select().from({entity}Schema).orderBy({entity}Schema.name).limit(validTake).offset(offset);
  
  const [dataTotal, dataResults] = await Promise.all([
    tryCatch(conditionTotal), 
    tryCatch(condition)
  ]);

  const [data{Entity}, err{Entity}] = dataResults;
  const [data{Entity}Tot, err{Entity}Tot] = dataTotal;

  if (err{Entity} && !data{Entity}) {
    throw new Error('Error no controlado buscando los {entities}, favor verificar.');
  }

  const totalCount = Number(data{Entity}Tot[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / validTake);

  return { totPage: totalPages, data: data{Entity}.map((item) => item as I{Entity}) };
};
```

### Pattern 3: Auth Tuple Return Pattern
For auth operations that return structured error data:

```typescript
export const signUpAction = async ({ email, name, password }: SignUpData): Promise<[IRetData, null] | [null, Error]> => {
  const [retData, errData] = await tryCatch(
    auth.api.signUpEmail({
      body: {
        email: email.toLowerCase().trim(),
        password,
        name,
        role: 'user',
      },
    }),
  );

  if (errData) {
    return [null, errData];
  }

  return [retData as IRetData, null];
};
```

### Pattern 4: Structured Object Return (Auth with try/catch)
For auth operations with complex error handling:

```typescript
export const changePassAction = async ({ userId, currentPassword, newPassword }: ChangePasswordRequest) => {
  try {
    // Session validation
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error('Usuario no autenticado');
    }

    if (userId !== session.user.id) {
      throw new Error('No está autorizado para cambiar la contraseña de otro usuario');
    }

    const result = await auth.api.changePassword({...});

    return {
      success: true,
      data: result,
      error: '',
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Ocurrió un problema.',
    };
  }
};
```

## Validation Patterns

### UUID Validation
Always validate UUIDs before database queries:

```typescript
export const get{Entity}ById = async (id: string): Promise<I{Entity}> => {
  if (!isValidUUID(id)) throw new Error(`El ${id}, no es valido, favor verificar.`);
  
  const [data, err] = await tryCatch(
    db.select().from({entity}Schema).where(eq({entity}Schema.id, id))
  );
  
  if (!data || data.length === 0) {
    throw new Error('{Entity} no encontrado');
  }
  
  return data[0] as I{Entity};
};
```

### Data Transformation
Apply transformations before database operations:

```typescript
export const ins{Entity} = async ({entity}: I{Entity}) => {
  const { id, name, email, ...rest } = {entity};

  const [dataResult, errResult] = await tryCatch(
    db
      .insert({entity}Schema)
      .values({
        name: capitalizeWords(name),     // Transform: capitalize
        email: email?.toLowerCase(),     // Transform: lowercase
        ...rest,
      })
      .returning(),
  );

  if (!dataResult && errResult) {
    console.error(errResult.message);
    throw new Error('Error no controlado creando el {entity}, favor verificar.');
  }

  return dataResult[0] as I{Entity};
};
```

## Templates by Action Type

### GET All (List)
```typescript
export const get{Entity}All = async (): Promise<I{Entity}[]> => {
  const [data, err] = await tryCatch(
    db.select().from({entity}Schema).orderBy({entity}Schema.name)
  );

  if (err && !data) {
    throw new Error('Error no controlado buscando los {entities}, favor verificar.');
  }

  return data.map((item) => item as I{Entity});
};
```

### GET by ID
```typescript
export const get{Entity}ById = async (id: string): Promise<I{Entity}> => {
  if (!isValidUUID(id)) throw new Error(`El ${id}, no es valido, favor verificar.`);

  const [data, err] = await tryCatch(
    db.select().from({entity}Schema).where(eq({entity}Schema.id, id))
  );

  if (err && !data) {
    throw new Error('Error no controlado buscando el {entity}, favor verificar.');
  }

  if (!data || data.length === 0) {
    throw new Error('{Entity} no encontrado');
  }

  return data[0] as I{Entity};
};
```

### INSERT (Create)
```typescript
export const ins{Entity} = async ({entity}: I{Entity}) => {
  const { id, name, email, ...rest } = {entity};

  const [dataResult, errResult] = await tryCatch(
    db
      .insert({entity}Schema)
      .values({
        name: capitalizeWords(name),
        email: email?.toLowerCase(),
        ...rest,
      })
      .returning(),
  );

  if (!dataResult && errResult) {
    console.error(errResult.message);
    throw new Error('Error no controlado creando el {entity}, favor verificar.');
  }

  return dataResult[0] as I{Entity};
};
```

### UPDATE
```typescript
export const update{Entity} = async (id: string, data: Partial<I{Entity}>): Promise<I{Entity}> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ID ${id}, no es valido, favor verificar.`);
  }

  const [result, err] = await tryCatch(
    db
      .update({entity}Schema)
      .set({ ...data, updatedAt: new Date() })
      .where(eq({entity}Schema.id, id))
      .returning(),
  );

  if (err) {
    console.error(err.message);
    throw new Error('Error no controlado actualizando el {entity}, favor verificar.');
  }

  if (!result || result.length === 0) {
    throw new Error('{Entity} no encontrado');
  }

  return result[0] as I{Entity};
};
```

### DELETE
```typescript
export const delete{Entity} = async (id: string): Promise<void> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ID ${id}, no es valido, favor verificar.`);
  }

  const [_, err] = await tryCatch(
    db.delete({entity}Schema).where(eq({entity}Schema.id, id))
  );

  if (err) {
    console.error(err.message);
    throw new Error('Error no controlado eliminando el {entity}, favor verificar.');
  }
};
```

## Error Message Conventions

Always use Spanish error messages following this pattern:
- `"Error no controlado [action] los/la/el [entity], favor verificar."` - Generic error
- `"[Entity] no encontrado/a"` - Not found
- `"El [id], no es valido, favor verificar."` - Invalid ID
- `"No está autorizado para [action]"` - Authorization error

## Dependencies

### Required Files
Ensure these exist before generating actions:
- `src/utils/tryCatch.ts` - Error handling utility
- `src/utils/isValidUUID.ts` - UUID validation
- `src/db/index.ts` - Database connection
- `src/db/schema/*.ts` - Table schemas

### Common Utilities
Available in `@/utils`:
- `tryCatch` - Error handling
- `isValidUUID` - UUID validation
- `capitalizeWords` - String capitalization
- `unicName` - Generate unique filenames

## Action Selection Guide

**For domain entities CRUD**: Follow the `{operation}-{entity}.ts` pattern
- READ → `get-{entity}.ts`
- CREATE/UPSERT → `ins-{entity}.ts`
- UPDATE → `upd-{entity}.ts`
- DELETE → `del-{entity}.ts`
- ASSOCIATIONS → `ass-{entity}.ts`

**For simple CRUD**: Use Pattern 1 (Direct Return with throw)
**For paginated lists**: Use Pattern 2 (Pagination Return)  
**For auth operations**: Use Pattern 3 (Tuple Return) or Pattern 4 (Structured Object)
**For file operations**: Follow minio/ pattern with tryCatch

## Important Notes

1. **Always use the naming convention** - `{operation}-{entity}.ts` for domain entities
2. **Always create a barrel export** - `index.ts` in each domain folder
3. **Always validate UUIDs** before database queries
4. **Always use tryCatch** for async operations
5. **Always type cast** database results: `as IEntity`
6. **Always handle both** error and success cases
7. **Use Spanish** for error messages
8. **Log errors** with console.error before throwing
9. **Use parallel queries** (Promise.all) for count + data pagination
10. **Transform data** (capitalize, lowercase) before insertion
11. **Keep special operations** (auth, files) with descriptive names
12. **Reference tags/** as the implementation example
