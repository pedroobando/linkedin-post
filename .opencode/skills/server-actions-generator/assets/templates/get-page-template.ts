'use server';

import { count, db } from '@/db';
import { ${entityName}s as ${entityName}Schema } from '@/db/schema/${entityName}s.schema';
import { I${EntityName} } from '@/interfaces';

import { tryCatch } from '@/utils';

interface PaginationOptions {
  page?: number;
  take?: number;
}

export const get${EntityName}Page = async (options: PaginationOptions): Promise<{ 
  totPage: number; 
  data: I${EntityName}[] 
}> => {
  const { page = 1, take = 12 } = options;

  const validPage = Math.max(1, Math.floor(page));
  const validTake = Math.max(1, Math.min(Math.floor(take), 100));
  const offset = (validPage - 1) * validTake;

  // Parallel queries for count and data
  const conditionTotal = db.select({ count: count() }).from(${entityName}Schema);
  
  const condition = db
    .select()
    .from(${entityName}Schema)
    .orderBy(${entityName}Schema.name)
    .limit(validTake)
    .offset(offset);

  const [dataTotal, dataResults] = await Promise.all([
    tryCatch(conditionTotal),
    tryCatch(condition)
  ]);

  const [data${EntityName}, err${EntityName}] = dataResults;
  const [data${EntityName}Tot, err${EntityName}Tot] = dataTotal;

  if (err${EntityName} && !data${EntityName}) {
    throw new Error('Error no controlado buscando los ${entityNames}, favor verificar.');
  }

  if (err${EntityName}Tot && !data${EntityName}Tot) {
    throw new Error('Error no controlado buscando la cantidad de ${entityNames}, favor verificar.');
  }

  const totalCount = Number(data${EntityName}Tot[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / validTake);

  return { 
    totPage: totalPages, 
    data: data${EntityName}.map((item) => item as I${EntityName}) 
  };
};
