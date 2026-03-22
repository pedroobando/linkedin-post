import { NextRequest } from 'next/server';
import { setUserRole } from '@/actions/users/set-user-role';
import { getUserbyEmail } from '@/actions/users/get-user';

// Interfaz para el cuerpo de la solicitud
interface AdminNowRequestBody {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    // Extraer el token del header Authorization
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        {
          success: false,
          message: 'Token de autorización requerido',
        },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7); // Remover 'Bearer ' del principio

    // Comparar el token con la variable de entorno
    const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN as string;

    if (!ADMIN_API_TOKEN || token !== ADMIN_API_TOKEN) {
      return Response.json(
        {
          success: false,
          message: 'Token inválido',
        },
        { status: 401 },
      );
    }

    // Obtener el email del body con tipado adecuado
    const body: AdminNowRequestBody = await request.json();
    const { email } = body;

    if (!email) {
      return Response.json(
        {
          success: false,
          message: 'Email es requerido en el cuerpo de la solicitud',
        },
        { status: 400 },
      );
    }

    // Buscar usuario por email
    const userData = await getUserbyEmail(email);

    // if (userError) {
    //   return Response.json(
    //     {
    //       success: false,
    //       message: `Usuario no encontrado: ${userError.message}`,
    //     },
    //     { status: 404 },
    //   );
    // }

    // Actualizar el usuario a activo (equivalente a rol admin en este sistema)
    const userDataUpd = await setUserRole({
      userId: userData.id,
      isActive: true,
    });

    // if (roleError) {
    //   return Response.json(
    //     {
    //       success: false,
    //       message: `Error actualizando rol: ${roleError.message}`,
    //     },
    //     { status: 500 },
    //   );
    // }

    return Response.json(
      {
        success: true,
        message: `Rol de usuario actualizado correctamente a admin para: ${email}`,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error('Error en adminnow API:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    return Response.json(
      {
        success: false,
        message: `Error interno del servidor: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
