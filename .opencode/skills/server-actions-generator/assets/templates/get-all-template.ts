'use server';

import { db } from '@/db';
import { ${entityName}s as ${entityName}Schema } from '@/db/schema/${entityName}s.schema';
import { I${EntityName} } from '@/interfaces';

import { tryCatch } from '@/utils';

export const get${EntityName}All = async (): Promise<I${EntityName}[]> => {
  const [data${EntityName}, err${EntityName}] = await tryCatch(
    db.select().from(${entityName}Schema).orderBy(${entityName}Schema.name)
  );

  if (err${EntityName} && !data${EntityName}) {
    throw new Error('Error no controlado buscando los ${entityNames}, favor verificar.');
  }

  return data${EntityName}.map((item) => item as I${EntityName});
};
