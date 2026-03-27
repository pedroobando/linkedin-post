/**
 * Main Datatable Generator
 * 
 * Orchestrates the generation of all datatable files for an entity.
 */

import * as fs from 'fs';
import * as path from 'path';
import { analyzeEntity, EntitySchema, SchemaField, toPascalCase, toCamelCase } from '../schema-analyzer';
import { generateColumns } from './generate-columns';
import { generateForm } from './generate-form';
import { generateHooks } from './generate-hooks';

// ============================================================================
// Types
// ============================================================================

export interface GenerateOptions {
  entity: string;
  outputPath: string;
  title?: string;
  description?: string;
  relations?: string[];
  schemaPath?: string;
}

// ============================================================================
// Template Utilities
// ============================================================================

function readTemplate(templateName: string): string {
  const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.template`);
  return fs.readFileSync(templatePath, 'utf-8');
}

function replacePlaceholders(template: string, replacements: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFile(filePath: string, content: string): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
}

// ============================================================================
// Page Generator
// ============================================================================

function generatePage(schema: EntitySchema, options: GenerateOptions): string {
  const template = readTemplate('page.tsx');
  const Entity = toPascalCase(options.entity);
  const entity = toCamelCase(options.entity);
  
  const replacements = {
    IMPORTS: `import { Metadata } from 'next';`,
    Entity,
    entity,
    title: options.title || Entity,
    description: options.description || `Manage ${Entity}`,
  };
  
  return replacePlaceholders(template, replacements);
}

// ============================================================================
// DataTable Component Generator
// ============================================================================

function generateDataTable(schema: EntitySchema, options: GenerateOptions): string {
  const template = readTemplate('data-table.tsx');
  const Entity = toPascalCase(options.entity);
  const entity = toCamelCase(options.entity);
  
  const replacements = {
    Entity,
    entity,
  };
  
  return replacePlaceholders(template, replacements);
}

// ============================================================================
// Main Generator Function
// ============================================================================

export async function generateDatatable(options: GenerateOptions): Promise<void> {
  const { entity, outputPath } = options;
  
  console.log(`🔍 Analyzing schema for entity: ${entity}`);
  
  // Analyze schema
  const schema = analyzeEntity(entity, {
    schemaFile: options.schemaPath,
  });
  
  console.log(`✅ Schema analyzed: ${schema.fields.length} fields found`);
  
  // Ensure output directory exists
  ensureDir(outputPath);
  ensureDir(path.join(outputPath, 'hooks'));
  
  // Generate files
  console.log(`📝 Generating files...`);
  
  // 1. Page
  const pageContent = generatePage(schema, options);
  writeFile(path.join(outputPath, 'page.tsx'), pageContent);
  console.log(`  ✓ page.tsx`);
  
  // 2. DataTable component
  const dataTableContent = generateDataTable(schema, options);
  writeFile(path.join(outputPath, `${toCamelCase(entity)}-data-table.tsx`), dataTableContent);
  console.log(`  ✓ ${toCamelCase(entity)}-data-table.tsx`);
  
  // 3. Columns
  const columnsContent = generateColumns(schema, options);
  writeFile(path.join(outputPath, `${toCamelCase(entity)}-columns.tsx`), columnsContent);
  console.log(`  ✓ ${toCamelCase(entity)}-columns.tsx`);
  
  // 4. Form
  const formContent = generateForm(schema, options);
  writeFile(path.join(outputPath, `${toCamelCase(entity)}-form.tsx`), formContent);
  console.log(`  ✓ ${toCamelCase(entity)}-form.tsx`);
  
  // 5. Hooks
  const hooksContent = generateHooks(schema, options);
  
  // Write hook files
  writeFile(
    path.join(outputPath, 'hooks', `use-${toCamelCase(entity)}-datatable.ts`),
    hooksContent.datatable
  );
  writeFile(
    path.join(outputPath, 'hooks', `use-${toCamelCase(entity)}-form.ts`),
    hooksContent.form
  );
  writeFile(
    path.join(outputPath, 'hooks', 'index.ts'),
    hooksContent.index
  );
  console.log(`  ✓ hooks/`);
  
  console.log(`\n✅ Datatable generated successfully at: ${outputPath}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Ensure server actions exist at: src/actions/${entity}/${entity}.ts`);
  console.log(`  2. Install required shadcn components if not already installed`);
  console.log(`  3. Add the route to your navigation`);
}

// ============================================================================
// CLI Interface
// ============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const getArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : undefined;
  };
  
  const hasFlag = (flag: string): boolean => args.includes(flag);
  
  const entity = getArg('--entity');
  const outputPath = getArg('--path');
  const title = getArg('--title');
  const description = getArg('--description');
  const schemaPath = getArg('--schema');
  const relations = getArg('--relations')?.split(',').map(r => r.trim());
  
  if (!entity || !outputPath) {
    console.error(`
Usage: generate-datatable --entity <name> --path <output> [options]

Options:
  --entity <name>        Entity name (required)
  --path <path>          Output path (required)
  --title <title>        Page title
  --description <desc>   Page description
  --schema <path>        Custom schema file path
  --relations <list>     Comma-separated list of related entities

Example:
  generate-datatable --entity tags --path src/app/(dash)/tags
  generate-datatable --entity articles --path src/app/(dash)/articles --relations tags
    `);
    process.exit(1);
  }
  
  generateDatatable({
    entity,
    outputPath,
    title,
    description,
    relations,
    schemaPath,
  }).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}

export default generateDatatable;
