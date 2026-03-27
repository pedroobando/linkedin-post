#!/usr/bin/env node

/**
 * CLI Script for Datatable Admin Generator
 * 
 * Usage:
 *   npx ts-node generators/cli.ts --entity tags --path src/app/(dash)/tags
 */

import { generateDatatable } from './generate-datatable';

const args = process.argv.slice(2);

// Parse arguments
const getArg = (flag: string): string | undefined => {
  const index = args.indexOf(flag);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : undefined;
};

const entity = getArg('--entity');
const outputPath = getArg('--path');
const title = getArg('--title');
const description = getArg('--description');
const schemaPath = getArg('--schema');
const relations = getArg('--relations')?.split(',').map(r => r.trim());

if (!entity || !outputPath) {
  console.error(`
╔════════════════════════════════════════════════════════════════╗
║           Datatable Admin Generator CLI                        ║
╚════════════════════════════════════════════════════════════════╝

Usage: generate-datatable --entity <name> --path <output> [options]

Required:
  --entity <name>        Entity name (e.g., tags, articles)
  --path <path>          Output path (e.g., src/app/(dash)/tags)

Optional:
  --title <title>        Page title (default: Entity name)
  --description <desc>   Page description
  --schema <path>        Custom schema file path
  --relations <list>     Comma-separated related entities

Examples:
  # Generate datatable for tags
  generate-datatable --entity tags --path src/app/(dash)/tags

  # Generate datatable with custom title
  generate-datatable --entity tags --path src/app/(dash)/tags \
    --title "Etiquetas" --description "Gestiona las etiquetas"

  # Generate datatable with relations
  generate-datatable --entity articles --path src/app/(dash)/articles \
    --relations tags,templates
`);
  process.exit(1);
}

console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Datatable Admin Generator                            ║
╚════════════════════════════════════════════════════════════════╝
`);

generateDatatable({
  entity,
  outputPath,
  title,
  description,
  relations,
  schemaPath,
}).then(() => {
  console.log(`
✨ Generation complete!
`);
}).catch((err: Error) => {
  console.error(`
❌ Error: ${err.message}
`);
  process.exit(1);
});
