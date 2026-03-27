'use server';

import { db } from '@/db';
import { IUser } from '@/interfaces';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { tryCatch } from '@/utils';

interface Props {
  userId: string;
  isActive: boolean;
}

export const setUserRole = async ({ userId }: Props): Promise<IUser> => {
  // const db = await getDb();
  const [dataUser, errorUser] = await tryCatch(
    db
      .update(users)
      .set({
        // isActive: isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning(),
  );

  if (errorUser) {
    const errorMessage = `Error actualizando los datos de los usuario: ${errorUser.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (dataUser.length === 0) {
    const errorMessage = `No se encontro al usuario`;
    throw new Error(errorMessage);
  }

  return dataUser[0] as IUser;
};
