'use server';

import { db, eq } from '@/db';
import { ${entityName}s as ${entityName}Schema } from '@/db/schema/${entityName}s.schema';

import { isValidUUID, tryCatch } from '@/utils';

export const del${EntityName} = async (id: string) => {
  if (!isValidUUID(id)) {
    throw new Error(`El ${id}, no es valido, favor verificar.`);
  }

  const [dataResult, errResult] = await tryCatch(
    db
      .delete(${entityName}Schema)
      .where(eq(${entityName}Schema.id, id))
      .returning(),
  );

  if (!dataResult && errResult) {
    console.error(errResult.message);
    throw new Error('Error no controlado eliminando el ${entityName}, favor verificar.');
  }

  return dataResult[0];
};
