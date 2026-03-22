'use server';

import { auth } from '@/lib/auth';
import { tryCatch } from '@/utils';

interface SignInData {
  email: string;
  password: string;
}

interface IRetData {
  token: string | null;
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    role: string;
  };
}

export const signInAction = async ({ email, password }: SignInData): Promise<[IRetData, null] | [null, Error]> => {
  const [retData, errData] = await tryCatch(
    auth.api.signInEmail({
      body: {
        email: email.toLowerCase().trim(),
        password,
      },
    }),
  );

  if (errData) {
    return [null, errData];
  }

  return [retData as IRetData, null];
};
