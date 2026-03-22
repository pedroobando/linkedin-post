'use server';

import { auth } from '@/lib/auth';
import { getServerSession } from '@/lib/get-session';
import { headers } from 'next/headers';

export const signOutAction = async () => {
  try {
    const oldSession = await getServerSession();
    if (!oldSession?.session) {
      return {
        success: true,
        data: null,
        error: 'Session del usuario cerrar.',
      };
    }

    const session = await auth.api.signOut({
      headers: await headers(),
    });

    return {
      success: !session,
      data: session,
      error: '',
    };
  } catch (error) {
    console.error('Error en signOutAction', error);

    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Problemas al cerrar la session del usuario.',
    };
  }
};
