/**
 * Hooks Generator
 * 
 * Generates React Query hooks for datatable operations.
 */

import { EntitySchema, SchemaField, toPascalCase, toCamelCase, getEditableFields } from '../schema-analyzer';
import { GenerateOptions } from './generate-datatable';

/**
 * Generate form data type based on editable fields
 */
function generateFormDataType(fields: SchemaField[]): string {
  if (fields.length === 0) return 'Record<string, any>';
  
  return fields
    .map(f => {
      let type = 'string';
      if (f.type === 'integer' || f.type === 'real') type = 'number';
      if (f.type === 'boolean') type = 'boolean';
      if (!f.isRequired) type += ' | undefined';
      return `  ${f.name}: ${type};`;
    })
    .join('\n');
}

/**
 * Generate default values for form hook
 */
function generateFormDefaults(fields: SchemaField[], forEmpty = false): string {
  if (fields.length === 0) return '';
  
  if (forEmpty) {
    return fields
      .map(f => {
        if (f.type === 'boolean') return `    ${f.name}: false`;
        if (f.type === 'integer' || f.type === 'real') return `    ${f.name}: undefined`;
        return `    ${f.name}: ''`;
      })
      .join(',\n');
  }
  
  return fields
    .map(f => `    ${f.name}: initialData?.${f.name}`)
    .join(',\n');
}

/**
 * Generate Zod schema for form hook
 */
function generateZodSchema(fields: SchemaField[]): string {
  if (fields.length === 0) {
    return 'z.object({})';
  }
  
  return fields
    .map(f => {
      let base = 'z.string()';
      if (f.type === 'integer') base = 'z.number().int()';
      if (f.type === 'real') base = 'z.number()';
      if (f.type === 'boolean') base = 'z.boolean()';
      if (f.type === 'enum' && f.enumValues) {
        base = `z.enum([${f.enumValues.map(v => `'${v}'`).join(', ')}])`;
      }
      
      if (f.isRequired) {
        if (f.type === 'text') return `  ${f.name}: ${base}.min(1, 'Este campo es requerido')`;
        return `  ${f.name}: ${base}`;
      }
      return `  ${f.name}: ${base}.optional()`;
    })
    .join(',\n');
}

/**
 * Generate the datatable hook
 */
function generateDatatableHook(schema: EntitySchema, options: GenerateOptions): string {
  const Entity = toPascalCase(options.entity);
  const entity = toCamelCase(options.entity);
  
  return `'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  get${Entity}Page,
  ins${Entity},
  set${Entity},
  del${Entity},
} from '@/actions/${entity}/${entity}';
import { ${Entity} } from '@/db/schema';

interface Use${Entity}DatatableProps {
  initialData: ${Entity}[];
  total: number;
  currentPage: number;
  pageSize: number;
}

export function use${Entity}Datatable({
  initialData,
  total,
  currentPage,
  pageSize,
}: Use${Entity}DatatableProps) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<${Entity} | null>(null);
  const [deleteItem, setDeleteItem] = React.useState<${Entity} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Query for fetching data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['${entity}', currentPage, pageSize],
    queryFn: () => get${Entity}Page({ page: currentPage, take: pageSize }),
    initialData: { data: initialData, total, totalPages: Math.ceil(total / pageSize) },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: ins${Entity},
    onSuccess: () => {
      toast.success('Registro creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear el registro');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: set${Entity},
    onSuccess: () => {
      toast.success('Registro actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      setIsFormOpen(false);
      setEditingItem(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar el registro');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: del${Entity},
    onSuccess: () => {
      toast.success('Registro eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      setIsDeleteDialogOpen(false);
      setDeleteItem(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar el registro');
    },
  });

  // Handlers
  const handleCreate = React.useCallback(() => {
    setEditingItem(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = React.useCallback((item: ${Entity}) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const handleDelete = React.useCallback((item: ${Entity}) => {
    setDeleteItem(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleSubmit = React.useCallback(
    async (formData: any) => {
      if (editingItem) {
        await updateMutation.mutateAsync({ ...formData, id: editingItem.id });
      } else {
        await createMutation.mutateAsync(formData);
      }
    },
    [editingItem, createMutation, updateMutation]
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (deleteItem) {
      await deleteMutation.mutateAsync(deleteItem.id);
    }
  }, [deleteItem, deleteMutation]);

  return {
    items: data?.data ?? [],
    isLoading,
    isFormOpen,
    editingItem,
    deleteItem,
    isDeleteDialogOpen,
    setIsFormOpen,
    setIsDeleteDialogOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSubmit,
    handleConfirmDelete,
    refetch,
  };
}
`;
}

/**
 * Generate the form hook
 */
function generateFormHook(schema: EntitySchema, options: GenerateOptions): string {
  const Entity = toPascalCase(options.entity);
  const editableFields = getEditableFields(schema);
  
  const zodSchema = generateZodSchema(editableFields);
  const defaultValues = generateFormDefaults(editableFields);
  const emptyValues = generateFormDefaults(editableFields, true);
  
  return `'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ${Entity} } from '@/db/schema';

// Validation schema
const formSchema = z.object({
${zodSchema}
});

export type ${Entity}FormData = z.infer<typeof formSchema>;

interface Use${Entity}FormProps {
  initialData?: ${Entity} | null;
}

export function use${Entity}Form({ initialData }: Use${Entity}FormProps = {}) {
  const defaultValues = React.useMemo(() => {
    if (initialData) {
      return {
${defaultValues}
      };
    }
    return {
${emptyValues}
    };
  }, [initialData]);

  const form = useForm<${Entity}FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Reset form when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset({
${defaultValues}
      });
    } else {
      form.reset({
${emptyValues}
      });
    }
  }, [initialData, form]);

  return {
    form,
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  };
}
`;
}

/**
 * Generate the hooks index file
 */
function generateHooksIndex(schema: EntitySchema, options: GenerateOptions): string {
  const Entity = toPascalCase(options.entity);
  const entity = toCamelCase(options.entity);
  
  return `// Export all hooks
export { use${Entity}Datatable } from './use-${entity}-datatable';
export { use${Entity}Form, type ${Entity}FormData } from './use-${entity}-form';
`;
}

/**
 * Generate all hooks
 */
export function generateHooks(schema: EntitySchema, options: GenerateOptions): {
  datatable: string;
  form: string;
  index: string;
} {
  return {
    datatable: generateDatatableHook(schema, options),
    form: generateFormHook(schema, options),
    index: generateHooksIndex(schema, options),
  };
}

export default generateHooks;
