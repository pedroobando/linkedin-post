/**
 * Columns Generator
 * 
 * Generates column definitions for TanStack Table based on schema fields.
 */

import { EntitySchema, SchemaField, getVisibleFields, toPascalCase } from '../schema-analyzer';
import { GenerateOptions } from './generate-datatable';

/**
 * Generate column definition for a field based on its type
 */
function generateColumnDefinition(field: SchemaField, schema: EntitySchema): string {
  const header = field.name.charAt(0).toUpperCase() + field.name.slice(1);
  
  // Skip id column (usually hidden)
  if (field.isPrimaryKey && field.name === 'id') {
    return '';
  }
  
  // Generate cell renderer based on field type
  const cellRenderer = (() => {
    switch (field.type) {
      case 'boolean':
        return `({ row }) => {
        const value = row.getValue("${field.name}");
        return (
          <Badge variant={value ? "default" : "secondary"}>
            {value ? "Sí" : "No"}
          </Badge>
        );
      }`;
      
      case 'timestamp':
        return `({ row }) => {
        const value = row.getValue("${field.name}");
        if (!value) return null;
        return (
          <span className="text-muted-foreground">
            {new Date(value as string).toLocaleDateString('es-ES')}
          </span>
        );
      }`;
      
      case 'enum':
        return `({ row }) => {
        const value = row.getValue("${field.name}");
        if (!value) return null;
        const variantMap: Record<string, string> = {
          ${field.enumValues?.map(v => `${v}: "default"`).join(',\n          ') || ''}
        };
        return (
          <Badge variant={variantMap[value as string] || "secondary"}>
            {value as string}
          </Badge>
        );
      }`;
      
      case 'fk':
        return `({ row }) => {
        const value = row.getValue("${field.name}");
        if (!value) return null;
        return <span className="font-medium">{value as string}</span>;
      }`;
      
      case 'text':
        if (field.name === 'name' || field.name === 'title') {
          return `({ row }) => {
        return <span className="font-medium">{row.getValue("${field.name}") as string}</span>;
      }`;
        }
        return undefined;
      
      default:
        return undefined;
    }
  })();
  
  // Build column definition
  const parts: string[] = [];
  parts.push(`    {`);
  parts.push(`      accessorKey: "${field.name}",`);
  parts.push(`      header: ({ column }) => (`);
  parts.push(`        <DataTableColumnHeader column={column} title="${header}" />`);
  parts.push(`      ),`);
  
  if (cellRenderer) {
    parts.push(`      cell: ${cellRenderer},`);
  } else {
    parts.push(`      cell: ({ row }) => <span>{row.getValue("${field.name}") as string}</span>,`);
  }
  
  // Enable filtering for text fields
  if (field.type === 'text' || field.type === 'enum') {
    parts.push(`      enableFiltering: true,`);
  }
  
  parts.push(`    },`);
  
  return parts.join('\n');
}

/**
 * Generate all columns for the schema
 */
export function generateColumns(schema: EntitySchema, options: GenerateOptions): string {
  const visibleFields = getVisibleFields(schema);
  const Entity = toPascalCase(options.entity);
  
  const columnDefinitions = visibleFields
    .map(field => generateColumnDefinition(field, schema))
    .filter(Boolean)
    .join('\n');
  
  return `'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ${Entity} } from '@/db/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

// Define actions interface for the columns
interface ${Entity}ColumnsActions {
  onEdit: (item: ${Entity}) => void;
  onDelete: (item: ${Entity}) => void;
}

export function getColumns(actions: ${Entity}ColumnsActions): ColumnDef<${Entity}>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
${columnDefinitions}
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => actions.onEdit(item)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => actions.onDelete(item)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

// Export empty columns array for compatibility
export const columns: ColumnDef<${Entity}>[] = [];
`;
}

export default generateColumns;
