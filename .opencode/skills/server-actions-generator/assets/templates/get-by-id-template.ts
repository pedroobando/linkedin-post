'use server';

import { db, eq } from '@/db';
import { ${entityName}s as ${entityName}Schema } from '@/db/schema/${entityName}s.schema';
import { I${EntityName} } from '@/interfaces';

import { isValidUUID, tryCatch } from '@/utils';

export const get${EntityName}byId = async (id: string): Promise<I${EntityName}> => {
  if (!isValidUUID(id)) {
    throw new Error(`El ${id}, no es valido, favor verificar.`);
  }

  const [data${EntityName}, err${EntityName}] = await tryCatch(
    db.select().from(${entityName}Schema).where(eq(${entityName}Schema.id, id))
  );

  if (err${EntityName} && !data${EntityName}) {
    console.error(err${EntityName}.message);
    throw new Error('Error no controlado buscando el ${entityName}, favor verificar.');
  }

  if (!data${EntityName} || data${EntityName}.length === 0) {
    throw new Error('${EntityName} no encontrado');
  }

  return data${EntityName}[0] as I${EntityName};
};
