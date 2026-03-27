'use server';

import { db } from '@/db';
import { ${entityName}s as ${entityName}Schema } from '@/db/schema/${entityName}s.schema';
import { I${EntityName} } from '@/interfaces';

import { tryCatch, capitalizeWords } from '@/utils';

export const ins${EntityName} = async (${entityName}: I${EntityName}) => {
  const { id, name, email, ...${entityName}Rest } = ${entityName};

  const [dataResult, errResult] = await tryCatch(
    db
      .insert(${entityName}Schema)
      .values({
        name: capitalizeWords(name),
        email: email?.toLowerCase(),
        ...${entityName}Rest,
      })
      .returning(),
  );

  if (!dataResult && errResult) {
    console.error(errResult.message);
    throw new Error('Error no controlado creando el ${entityName}, favor verificar.');
  }

  return dataResult[0] as I${EntityName};
};
