/**
 * API Endpoint: Sign Up User
 *
 * Este endpoint permite registrar un nuevo usuario en el sistema.
 * Devuelve un token JWT que puede ser usado para autenticación en APIs externas.
 *
 * @usage
 * POST /api/auth/signup-user
 *
 * @headers
 * Authorization: Bearer {ADMIN_API_TOKEN}
 * Content-Type: application/json
 *
 * @body
 * {
 *   "name": "Nombre del Usuario",
 *   "email": "usuario@ejemplo.com",
 *   "password": "contraseña123"
 * }
 *
 * @responses
 * 201: {
 *   "message": "User created successfully",
 *   "user": {
 *     "id": "user_id_generado",
 *     "createdAt": "2023-01-01T00:00:00.000Z",
 *     "updatedAt": "2023-01-01T00:00:00.000Z",
 *     "email": "usuario@ejemplo.com",
 *     "emailVerified": false,
 *     "name": "Nombre del Usuario",
 *     "role": "user"
 *   },
 *   "jwtToken": "token_jwt_para_api_externas"
 * }
 *
 * 400: {
 *   "error": "Missing required fields: name, email, password"
 * }
 *
 * 401: {
 *   "error": "Invalid token"
 * }
 *
 * 409: {
 *   "error": "User with this email already exists"
 * }
 *
 * 500: {
 *   "error": "Internal server error"
 * }
 *
 * @example
 * curl -X POST http://localhost:3000/api/auth/signup-user \
 *   -H "Authorization: Bearer tu_token_admin_aqui" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "Juan Pérez",
 *     "email": "juan@example.com",
 *     "password": "contraseña123"
 *   }'
 *
 * @note
 * Este endpoint requiere un token de administrador para autenticación.
 * Además de la información de usuario estándar, devuelve un token JWT
 * que puede ser usado para autenticación en APIs externas.
 */

import { NextRequest } from 'next/server';
import { signUpAction } from '@/actions/auth/signup-action';
import { generateJWTToken } from '@/lib/generate-jwt';

// Función para verificar el token de autorización
const verifyToken = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7); // Remover 'Bearer ' del principio
  const adminToken = process.env.ADMIN_API_TOKEN;

  return token === adminToken;
};

export async function POST(req: NextRequest) {
  // Verificar el token de autorización
  if (!verifyToken(req)) {
    return Response.json(
      {
        success: false,
        message: 'Token de autorización inválido o ausente.',
      },
      { status: 401 },
    );
  }

  try {
    // Parse the request body
    const userData = await req.json();

    // Validate required fields
    if (!userData.name || !userData.email || !userData.password) {
      return Response.json({ error: 'Missing required fields: name, email, password' }, { status: 400 });
    }

    // Use the server action to create the user
    const [result, error] = await signUpAction({
      email: userData.email,
      name: userData.name,
      password: userData.password,
    });

    if (error) {
      // Check if the error is due to duplicate email
      if (error.message.includes('email') && error.message.includes('already')) {
        return Response.json({ error: 'User with this email already exists' }, { status: 409 });
      }

      console.error('Error creating user:', error);
      return Response.json({ error: error.message || 'Error creating user' }, { status: 500 });
    }

    // Generar un token JWT para uso en APIs externas
    const jwtToken = await generateJWTToken(
      {
        userId: result?.user.id,
      },
      '2d',
    ); // 2 días de expiración

    // Return success response
    return Response.json(
      {
        message: 'User created successfully',
        user: result?.user,
        jwtToken: jwtToken,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
