# Available Utilities Reference

Reference of all utilities available in `@/utils` for use in Server Actions.

## tryCatch

**Location**: `src/utils/tryCatch.ts`

**Purpose**: Wrap async operations to avoid try/catch blocks

**Signature**:
```typescript
type Result<T, E = Error> = readonly [T, null] | readonly [null, E];

export async function tryCatch<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>>
```

**Usage**:
```typescript
const [data, err] = await tryCatch(db.select().from(schema));
if (err && !data) {
  throw new Error('Operation failed');
}
```

## isValidUUID

**Location**: `src/utils/isValidUUID.ts`

**Purpose**: Validate UUID format before database queries

**Signature**:
```typescript
export function isValidUUID(uuid: string): boolean
```

**Usage**:
```typescript
if (!isValidUUID(id)) {
  throw new Error(`El ${id}, no es valido, favor verificar.`);
}
```

## capitalizeWords

**Location**: `src/utils/capitalizeWords.ts`

**Purpose**: Capitalize each word in a string

**Signature**:
```typescript
export function capitalizeWords(str: string): string
```

**Usage**:
```typescript
name: capitalizeWords(name)  // "john doe" → "John Doe"
```

## unicName

**Location**: `src/utils/unicName.ts`

**Purpose**: Generate unique filename with timestamp

**Signature**:
```typescript
export function unicName(originalName: string): string
```

**Usage**:
```typescript
const fileName = unicName(originalFile.name);
// "photo.jpg" → "photo_1679834567890.jpg"
```

## sleep

**Location**: `src/utils/sleep.ts`

**Purpose**: Promise-based delay

**Signature**:
```typescript
export function sleep(ms: number): Promise<void>
```

**Usage**:
```typescript
await sleep(1000); // Wait 1 second
```

## timeFormat

**Location**: `src/utils/time-format.ts`

**Purpose**: Format dates for display

## timeConverter

**Location**: `src/utils/time-converter.ts`

**Purpose**: Convert between time formats

## currencyFormat

**Location**: `src/utils/currencyFormat.ts`

**Purpose**: Format currency values

## genPaginatedNumbers

**Location**: `src/utils/genPaginatedNumbers.ts`

**Purpose**: Generate pagination number arrays

## Fonts

**Location**: `src/utils/fonts.ts`

**Purpose**: Font loading utilities