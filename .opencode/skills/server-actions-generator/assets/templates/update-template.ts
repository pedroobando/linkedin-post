'use server';

import { db, eq } from '@/db';
import { ${entityName}s as ${entityName}Schema } from '@/db/schema/${entityName}s.schema';
import { I${EntityName} } from '@/interfaces';

import { tryCatch } from '@/utils';

interface Props {
  ${entityName}Id: string;
  isActive: boolean;
}

export const set${EntityName} = async ({ ${entityName}Id, isActive }: Props): Promise<I${EntityName}> => {
  const [data${EntityName}, error${EntityName}] = await tryCatch(
    db
      .update(${entityName}Schema)
      .set({
        isActive: isActive,
        updatedAt: new Date(),
      })
      .where(eq(${entityName}Schema.id, ${entityName}Id))
      .returning(),
  );

  if (error${EntityName}) {
    const errorMessage = `Error actualizando ${entityName}: ${error${EntityName}.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (data${EntityName}.length === 0) {
    const errorMessage = `No se encontro el ${entityName}`;
    throw new Error(errorMessage);
  }

  return data${EntityName}[0] as I${EntityName};
};
