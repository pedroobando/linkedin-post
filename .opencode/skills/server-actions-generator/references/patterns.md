# Server Actions Patterns Reference

Complete reference of patterns used in this project's Server Actions.

## Table of Contents

1. [Import Patterns](#import-patterns)
2. [Error Handling](#error-handling)
3. [Return Type Patterns](#return-type-patterns)
4. [Database Operations](#database-operations)
5. [Validation](#validation)
6. [File Organization](#file-organization)

## Import Patterns

### Standard Database Action Imports
```typescript
import { count, db, eq } from '@/db';
import { customers as customerSchema } from '@/db/schema/customers.schema';
import { ICustomer } from '@/interfaces';
import { isValidUUID, tryCatch, capitalizeWords } from '@/utils';
```

Pattern breakdown:
- `count, db, eq` from `@/db` - Database connection and operators
- Schema aliased: `customers as customerSchema` for clarity
- Interface from `@/interfaces` - Type definitions
- Utilities from `@/utils` - tryCatch, validation, transforms

### Auth Action Imports
```typescript
import { auth } from '@/lib/auth';
import { tryCatch } from '@/utils';
import { headers } from 'next/headers';
import { getServerSession } from '@/lib/get-session';
```

### External Service Imports
```typescript
import { unicName, tryCatch } from '@/utils';
import { getMinioClient } from '@/lib/minio-client';
import { createBucket } from '@/actions/minio/create-bucket';
```

## Error Handling

### The tryCatch Pattern

All async operations use the custom `tryCatch` utility:

```typescript
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

### Error Handling Checklist

✅ Always destructure the result: `const [data, err] = await tryCatch(...)`
✅ Check error first: `if (err && !data)`
✅ Log with console.error: `console.error(err.message)`
✅ Throw descriptive errors: `throw new Error('descriptive message')`
✅ Use Spanish for error messages

## Return Type Patterns

### Pattern A: Simple Array Return
```typescript
export const getAll = async (): Promise<IEntity[]> => {
  const [data, err] = await tryCatch(db.select().from(schema));
  if (err && !data) throw new Error('...');
  return data.map(item => item as IEntity);
};
```

### Pattern B: Pagination Return
```typescript
interface PaginationOptions { page?: number; take?: number; }

export const getPage = async (options: PaginationOptions): Promise<{ 
  totPage: number; 
  data: IEntity[] 
}> => {
  const { page = 1, take = 12 } = options;
  const validPage = Math.max(1, Math.floor(page));
  const validTake = Math.max(1, Math.min(Math.floor(take), 100));
  const offset = (validPage - 1) * validTake;

  const [countResult, dataResult] = await Promise.all([
    tryCatch(db.select({ count: count() }).from(schema)),
    tryCatch(db.select().from(schema).limit(validTake).offset(offset))
  ]);

  // Error handling for both queries...
  
  const totalCount = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / validTake);

  return { totPage: totalPages, data: data.map(item => item as IEntity) };
};
```

### Pattern C: Auth Tuple Return
```typescript
export const action = async (data: Input): Promise<[SuccessType, null] | [null, Error]> => {
  const [result, err] = await tryCatch(asyncOperation(data));
  if (err) return [null, err];
  return [result as SuccessType, null];
};
```

### Pattern D: Structured Object Return
```typescript
export const action = async (data: Input) => {
  try {
    // Validation and operation...
    return { success: true, data: result, error: '' };
  } catch (error) {
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
```

## Database Operations

### SELECT All
```typescript
const [data, err] = await tryCatch(
  db.select().from(schema).orderBy(schema.name)
);
```

### SELECT by ID
```typescript
const [data, err] = await tryCatch(
  db.select().from(schema).where(eq(schema.id, id))
);
```

### SELECT with Pagination
```typescript
const [data, err] = await tryCatch(
  db
    .select()
    .from(schema)
    .orderBy(schema.name)
    .limit(validTake)
    .offset(offset)
);
```

### INSERT
```typescript
const [data, err] = await tryCatch(
  db
    .insert(schema)
    .values({ name, email, ...rest })
    .returning()
);
```

### UPDATE
```typescript
const [data, err] = await tryCatch(
  db
    .update(schema)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(schema.id, id))
    .returning()
);
```

### DELETE
```typescript
const [data, err] = await tryCatch(
  db
    .delete(schema)
    .where(eq(schema.id, id))
    .returning()
);
```

### COUNT
```typescript
const [data, err] = await tryCatch(
  db.select({ count: count() }).from(schema)
);
const total = Number(data[0]?.count || 0);
```

## Validation

### UUID Validation
```typescript
import { isValidUUID } from '@/utils';

if (!isValidUUID(id)) {
  throw new Error(`El ${id}, no es valido, favor verificar.`);
}
```

### Data Transformation
```typescript
import { capitalizeWords } from '@/utils';

// Before INSERT
name: capitalizeWords(name),
email: email?.toLowerCase(),
```

### Pagination Validation
```typescript
const validPage = Math.max(1, Math.floor(page));
const validTake = Math.max(1, Math.min(Math.floor(take), 100));
```

## File Organization

### By Domain (Recommended)
```
src/actions/
├── customer/
│   ├── get-customer.ts    # getCustomerAll, getCustomerPage, getCustomerbyId
│   ├── ins-customer.ts    # insCustomer
│   ├── del-customer.ts    # delCustomer
│   └── set-customer.ts    # setCustomer
├── inventory/
│   ├── get-inventory.ts
│   ├── ins-inventory.ts
│   ├── del-inventory.ts
│   └── set-inventory.ts
└── index.ts               # Barrel exports
```

### Naming Conventions
- **Files**: `kebab-case.ts`
- **Functions**: `camelCase` with domain prefix
  - `get<Entity>All` - List all
  - `get<Entity>Page` - Paginated list
  - `get<Entity>byId` - Single by ID
  - `get<Entity>byEmail` - Single by field
  - `ins<Entity>` - Insert/Create
  - `set<Entity>` - Update
  - `del<Entity>` - Delete
  - `<action>Action` - Auth actions

### Barrel Export Pattern (src/actions/index.ts)
```typescript
// Customer Actions
export { getCustomerAll, getCustomerPage, getCustomerbyId } from '@/actions/customer/get-customer';
export { insCustomer } from '@/actions/customer/ins-customer';
export { setCustomer } from '@/actions/customer/set-customer';
export { delCustomer } from '@/actions/customer/del-customer';

// Inventory Actions
export { getInventoryAll, getInventoryPage, getInventorybyId } from '@/actions/inventory/get-inventory';
export { insInventory } from '@/actions/inventory/ins-inventory';
export { setInventory } from '@/actions/inventory/set-inventory';
export { delInventory } from '@/actions/inventory/del-inventory';
```

## Error Messages Reference

### Generic Errors
- `"Error no controlado buscando los {entities}, favor verificar."`
- `"Error no controlado creando el {entity}, favor verificar."`
- `"Error no controlado actualizando el {entity}, favor verificar."`

### Not Found
- `"{Entity} no encontrado"` (masculine)
- `"{Entity} no encontrada"` (feminine)

### Validation
- `"El {id}, no es valido, favor verificar."`
- `"No se encontro el {entity}"`

### Authorization
- `"Usuario no autenticado"`
- `"No está autorizado para {action}"`