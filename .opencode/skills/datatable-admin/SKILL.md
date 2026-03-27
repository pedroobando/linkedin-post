# Skill: Datatable Admin Generator

## Purpose

Generates complete administrative datatable interfaces for Next.js projects using Drizzle ORM, TanStack Table, and shadcn/ui components.

## Features

- **Automatic Schema Detection**: Reads Drizzle schemas and detects fields, types, relations, and enums
- **Complete CRUD Interface**: Generates list, create, edit, and delete functionality
- **Server Actions Integration**: Uses existing server actions following project conventions
- **Responsive Design**: Mobile-friendly with shadcn/ui components
- **Type-Safe**: Full TypeScript support with generated types

## Installation

This skill is automatically available in projects with the following dependencies:

```bash
# Required dependencies (should already be installed)
pnpm add @tanstack/react-table @tanstack/react-query

# shadcn components needed
npx shadcn add table button input dropdown-menu checkbox dialog skeleton badge select
```

## Project Conventions

### Server Actions Convention

The skill assumes server actions follow this naming pattern:

```typescript
// src/actions/{entity}/{entity}.ts

// Get paginated results
export async function get{Entity}Page({ 
  page, 
  take, 
  search? 
}: { 
  page: number; 
  take: number;
  search?: string;
}) => Promise<{ data: Entity[]; total: number; totalPages: number }>

// Get all (for selects/relations)
export async function get{Entity}All() => Promise<Entity[]>

// Get single by ID
export async function get{Entity}ById(id: string) => Promise<Entity | null>

// Create
export async function ins{Entity}(data: New{Entity}) => Promise<Entity>

// Update
export async function set{Entity}(data: Partial<Entity> & { id: string }) => Promise<Entity>

// Delete
export async function del{Entity}(id: string) => Promise<void>
```

### Schema Convention

Drizzle schemas should export types:

```typescript
// src/db/schema/{entity}.ts
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull().unique(),
  // ... fields
});

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
```

## Usage

### Generate Datatable for an Entity

```bash
# Basic usage
generate-datatable --entity tags --path src/app/(dash)/tags

# With relations
generate-datatable --entity articles --path src/app/(dash)/articles --relations tags

# With custom options
generate-datatable \
  --entity templates \
  --path src/app/(dash)/templates \
  --title "Plantillas" \
  --description "Gestiona las plantillas de artículos"
```

### Programmatic Usage

```typescript
import { generateDatatable } from './generators/generate-datatable';

await generateDatatable({
  entity: 'tags',
  outputPath: 'src/app/(dash)/tags',
  title: 'Etiquetas',
  description: 'Gestiona las etiquetas de artículos'
});
```

## Generated Files Structure

```
{outputPath}/
├── page.tsx                    # Server component (list view)
├── columns.tsx                 # Column definitions
├── data-table.tsx              # Reusable DataTable component
├── form.tsx                    # Create/Edit form
├── actions.ts                  # Client-side action wrappers
└── hooks/
    ├── use-datatable.ts        # Data fetching and mutations
    └── use-form.ts             # Form handling
```

## Field Type Mapping

| Drizzle Type | UI Component | Zod Validation |
|--------------|--------------|----------------|
| `text` | `Input` | `z.string().min(1)` |
| `integer` | `Input type="number"` | `z.number().int()` |
| `real` | `Input type="number"` | `z.number()` |
| `boolean` | `Switch` | `z.boolean()` |
| `timestamp` | Read-only | Auto-generated |
| `enum` | `Select` | `z.enum([...])` |
| `FK (text)` | `Select`/`Combobox` | `z.string()` |

## Customization

### Custom Columns

Modify `columns.tsx` after generation:

```typescript
export const columns: ColumnDef<Tag>[] = [
  // ... auto-generated columns
  {
    accessorKey: "customField",
    header: "Campo Personalizado",
    cell: ({ row }) => {
      const value = row.getValue("customField");
      return <Badge variant={value ? "default" : "secondary"}>{value}</Badge>;
    },
  },
];
```

### Custom Form Fields

Modify `form.tsx` to add custom fields:

```typescript
<FormField
  control={form.control}
  name="customField"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Campo Personalizado</FormLabel>
      <FormControl>
        <CustomComponent {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Styling

The generated components use Tailwind CSS classes. Override by:

1. Modifying component classes directly
2. Using CSS variables from your theme
3. Extending the component with wrapper styles

## Examples

### Tags Entity (Simple)

```bash
generate-datatable --entity tags --path src/app/(dash)/tags
```

Generates a simple CRUD for tags with:
- Name (text, required)
- Slug (text, auto-generated from name)
- CreatedAt (timestamp, read-only)

### Articles Entity (With Relations)

```bash
generate-datatable \
  --entity articles \
  --path src/app/(dash)/articles \
  --relations tags
```

Generates a datatable with:
- All article fields
- Tag selector (multi-select)
- Status badges
- Date formatting

### Templates Entity

```bash
generate-datatable \
  --entity templates \
  --path src/app/(dash)/templates \
  --title "Plantillas" \
  --description "Gestiona las plantillas de LinkedIn"
```

## Architecture

### Schema Analyzer

The `schema-analyzer.ts` utility:
1. Reads the Drizzle table definition
2. Extracts field names, types, and constraints
3. Detects relations through foreign keys
4. Identifies enums and timestamps
5. Returns structured metadata for code generation

### Code Generators

Generators use Handlebars-style templating:
- Replace `{{Entity}}` with PascalCase entity name
- Replace `{{entity}}` with camelCase entity name
- Replace `{{fields}}` with generated field arrays
- Inject schema metadata into templates

### Template System

Templates are TypeScript files with placeholders:
- `{{IMPORTS}}` - Dynamic imports based on fields
- `{{FIELDS}}` - Field definitions and form controls
- `{{COLUMNS}}` - Column definitions for the table
- `{{TYPES}}` - TypeScript interfaces

## Troubleshooting

### Server Actions Not Found

Ensure server actions exist at `src/actions/{entity}/{entity}.ts` with the correct naming convention.

### Schema Not Detected

Verify the schema exports both the table and types:
```typescript
export const entityName = sqliteTable(...);
export type EntityName = typeof entityName.$inferSelect;
export type NewEntityName = typeof entityName.$inferInsert;
```

### Type Errors

Run `pnpm db:generate` to ensure types are up to date with the schema.

## Dependencies

- `@tanstack/react-table` - Headless table library
- `@tanstack/react-query` - Data fetching and caching
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@hookform/resolvers` - Zod resolver for react-hook-form
- shadcn/ui components: table, button, input, dialog, select, etc.

## License

Part of the LinkedIn Post project skill system.
