'use server';

import { count, db, eq } from '@/db';

import { users as userScrema } from '@/db/schema';
import { IUser } from '@/interfaces';

import { isValidUUID, tryCatch } from '@/utils';

// const columnCondition = {
//   id: menuDigitalSchema.id,
//   name: menuDigitalSchema.name,
//   description: menuDigitalSchema.description,
//   price: menuDigitalSchema.price,
//   isActive: menuDigitalSchema.isActive,
//   categoryId: menuDigitalSchema.categoryId,
//   categoryName: menuCatSchema.name,
//   createdAt: menuDigitalSchema.createdAt,
// };

export const getUsersAll = async (): Promise<IUser[]> => {
  const [dataUser, errUser] = await tryCatch(db.select().from(userScrema).orderBy(userScrema.name));

  if (errUser && !dataUser) {
    throw new Error('Error no controlado buscando los usuarios, favor verificar.');
  }

  return dataUser.map((item) => item as IUser);
};

interface PaginationOptions {
  page?: number;
  take?: number;
}

export const getUsersPage = async (options: PaginationOptions): Promise<{ totPage: number; data: IUser[] }> => {
  const { page = 1, take = 12 } = options;

  const validPage = Math.max(1, Math.floor(page));
  const validTake = Math.max(1, Math.min(Math.floor(take), 100));
  const offset = (validPage - 1) * validTake;

  // Crear consultas para contar total y obtener resultados
  const conditionTotal = db.select({ count: count() }).from(userScrema);

  const condition = db.select().from(userScrema).orderBy(userScrema.name).limit(validTake).offset(offset);

  const [dataTotal, dataResults] = await Promise.all([tryCatch(conditionTotal), tryCatch(condition)]);

  const [dataUser, errUser] = dataResults;
  const [dataUserTot, errUserTot] = dataTotal;

  if (errUser && !dataUser) {
    throw new Error('Error no controlado buscando el usuario, favor verificar.');
  }

  if (errUserTot && !dataUserTot) {
    throw new Error('Error no controlado buscando el total de usuario, favor verificar.');
  }

  const totalCount = Number(dataUserTot[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / validTake);

  return { totPage: totalPages, data: dataUser.map((item) => item as IUser) };
};

export const getUserbyId = async (id: string): Promise<IUser> => {
  if (!isValidUUID(id)) throw new Error(`El ${id}, del usuario no es valida, favor verificar.`);

  const [dataUser, errUser] = await tryCatch(db.select().from(userScrema).where(eq(userScrema.id, id)));

  if (errUser && !dataUser) {
    console.error(errUser.message);
    throw new Error('Error no controlado buscando el usuario, favor verificar.');
  }

  if (!dataUser || dataUser.length === 0) {
    throw new Error('Usuario no localizado');
  }

  return dataUser[0] as IUser;
};

export const getUserbyEmail = async (email: string): Promise<IUser> => {
  if (!email) throw new Error(`El ${email}, del usuario no es valida, favor verificar.`);

  const [dataUser, errUser] = await tryCatch(db.select().from(userScrema).where(eq(userScrema.email, email)));

  if (errUser && !dataUser) {
    console.error(errUser.message);
    throw new Error('Error no controlado buscando el usuario, favor verificar.');
  }

  if (!dataUser || dataUser.length === 0) {
    throw new Error('Usuario no localizado');
  }

  return dataUser[0] as IUser;
};
