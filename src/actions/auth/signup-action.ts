'use server';

import { auth } from '@/lib/auth';
import { tryCatch } from '@/utils';

interface SignUpData {
  email: string;
  password: string;
  name: string;
}

interface IRetData {
  token: null;
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

export const signUpAction = async ({ email, name, password }: SignUpData): Promise<[IRetData, null] | [null, Error]> => {
  const [retData, errData] = await tryCatch(
    auth.api.signUpEmail({
      body: {
        email: email.toLowerCase().trim(),
        password,
        name,
        role: 'user',
      },
    }),
  );

  if (errData) {
    return [null, errData];
  }

  return [retData as IRetData, null];
};
