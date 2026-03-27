/**
 * Example: Generate Datatable for Tags Entity
 * 
 * This example demonstrates how to use the datatable generator
 * for the 'tags' entity in the LinkedIn Post project.
 */

import { generateDatatable } from './generate-datatable';

async function generateTagsDatatable() {
  console.log('🚀 Generating Tags Datatable...\n');
  
  try {
    await generateDatatable({
      entity: 'tags',
      outputPath: 'src/app/(dash)/tags',
      title: 'Etiquetas',
      description: 'Gestiona las etiquetas para clasificar artículos de LinkedIn',
    });
    
    console.log('\n✅ Tags datatable generated successfully!');
    console.log('\n📁 Generated files:');
    console.log('  • src/app/(dash)/tags/page.tsx');
    console.log('  • src/app/(dash)/tags/tags-data-table.tsx');
    console.log('  • src/app/(dash)/tags/tags-columns.tsx');
    console.log('  • src/app/(dash)/tags/tags-form.tsx');
    console.log('  • src/app/(dash)/tags/hooks/use-tags-datatable.ts');
    console.log('  • src/app/(dash)/tags/hooks/use-tags-form.ts');
    console.log('  • src/app/(dash)/tags/hooks/index.ts');
    
    console.log('\n📋 Next steps:');
    console.log('  1. Verify server actions exist at: src/actions/tags/tags.ts');
    console.log('  2. Add shadcn components if needed:');
    console.log('     npx shadcn add table button input dialog form select switch');
    console.log('  3. Install dependencies if not present:');
    console.log('     pnpm add @tanstack/react-table @tanstack/react-query react-hook-form zod @hookform/resolvers');
    console.log('  4. Add route to navigation');
    console.log('  5. Visit http://localhost:3000/tags');
    
  } catch (error) {
    console.error('\n❌ Error generating tags datatable:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateTagsDatatable();
}

export { generateTagsDatatable };
