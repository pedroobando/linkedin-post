/**
 * Form Generator
 * 
 * Generates form components with validation based on schema fields.
 */

import { EntitySchema, SchemaField, getEditableFields, toPascalCase, generateZodValidation } from '../schema-analyzer';
import { GenerateOptions } from './generate-datatable';

/**
 * Generate form field component based on field type
 */
function generateFormField(field: SchemaField, index: number): string {
  const label = field.name.charAt(0).toUpperCase() + field.name.slice(1);
  
  switch (field.type) {
    case 'text':
      return `<FormField
              control={form.control}
              name="${field.name}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>${label}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa ${label.toLowerCase()}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
    
    case 'integer':
    case 'real':
      return `<FormField
              control={form.control}
              name="${field.name}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>${label}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Ingresa ${label.toLowerCase()}"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
    
    case 'boolean':
      return `<FormField
              control={form.control}
              name="${field.name}"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">${label}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />`;
    
    case 'enum':
      if (field.enumValues && field.enumValues.length > 0) {
        const options = field.enumValues
          .map(v => `                      <SelectItem value="${v}">${v}</SelectItem>`)
          .join('\n');
        
        return `<FormField
              control={form.control}
              name="${field.name}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>${label}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona ${label.toLowerCase()}" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
${options}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />`;
      }
      return `<FormField
              control={form.control}
              name="${field.name}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>${label}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa ${label.toLowerCase()}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
    
    case 'fk':
      return `<FormField
              control={form.control}
              name="${field.name}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>${label}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa ${label.toLowerCase()}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
    
    default:
      return `<FormField
              control={form.control}
              name="${field.name}"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>${label}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingresa ${label.toLowerCase()}" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />`;
  }
}

/**
 * Generate default values for the form
 */
function generateDefaultValues(fields: SchemaField[], isEmpty = false): string {
  if (isEmpty) {
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
 * Generate Zod schema fields
 */
function generateZodSchemaFields(fields: SchemaField[]): string {
  return fields
    .map(f => `  ${f.name}: ${generateZodValidation(f)}`)
    .join(',\n');
}

/**
 * Generate the complete form component
 */
export function generateForm(schema: EntitySchema, options: GenerateOptions): string {
  const Entity = toPascalCase(options.entity);
  const editableFields = getEditableFields(schema);
  
  // Generate form fields
  const formFields = editableFields
    .map((field, index) => generateFormField(field, index))
    .join('\n            ');
  
  // Generate Zod schema
  const zodSchemaFields = generateZodSchemaFields(editableFields);
  
  // Generate default values
  const defaultValues = generateDefaultValues(editableFields);
  const emptyValues = generateDefaultValues(editableFields, true);
  
  return `'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ${Entity} } from '@/db/schema';
import { Loader2 } from 'lucide-react';

// Validation schema
const formSchema = z.object({
${zodSchemaFields}
});

export type ${Entity}FormData = z.infer<typeof formSchema>;

interface ${Entity}FormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ${Entity} | null;
  onSubmit: (data: ${Entity}FormData) => Promise<void>;
}

export function ${Entity}Form({ isOpen, onClose, initialData, onSubmit }: ${Entity}FormProps) {
  const form = useForm<${Entity}FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
${emptyValues}
    },
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

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (data: ${Entity}FormData) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar ${Entity}' : 'Crear ${Entity}'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Modifica los datos y guarda los cambios.'
              : 'Completa los datos para crear un nuevo registro.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            ${formFields}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Guardar cambios' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
`;
}

export default generateForm;
