'use server';

import { auth } from '@/lib/auth';
import { ApiError } from 'next/dist/server/api-utils';
import { headers } from 'next/headers';
import { getServerSession } from '@/lib/get-session';

interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export const changePassAction = async ({ userId, currentPassword, newPassword }: ChangePasswordRequest) => {
  try {
    // Verify the user is authenticated and get the current session
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error('Usuario no autenticado');
    }

    // Verify that the user is changing their own password
    if (userId !== session.user.id) {
      throw new Error('No está autorizado para cambiar la contraseña de otro usuario');
    }

    const result = await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });

    if (!result.user?.id) {
      throw new Error(`Problemas al intentar cambiar el password del usuario.`);
    }

    return {
      success: true,
      data: result,
      error: '',
    };
  } catch (error) {
    const retError = error as ApiError;

    if (retError.statusCode == 422) {
      return {
        success: false,
        data: null,
        error: `Error de validación: favor verificar los datos.`,
      };
    }

    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Ocurrió un problema cambiando el password del usuario.',
    };
  }
};
