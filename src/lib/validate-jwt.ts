/**
 * Helper para validar tokens JWT
 *
 * Este helper se puede usar en endpoints API para validar tokens JWT
 * emitidos por el sistema de autenticación.
 */

import jwt from 'jsonwebtoken';

interface JWTUserPayload {
  userId: string;
  email: string;
  role?: string;
  exp?: number;
  iat?: number;
}

/**
 * Valida un token JWT y devuelve la información del usuario si es válido
 * @param token - El token JWT a validar
 * @returns La carga útil del token si es válido, o null si no lo es
 */
export const validateJWTToken = async (token: string): Promise<JWTUserPayload | null> => {
  try {
    const jwtSecret = process.env.BETTER_AUTH_JWT_SECRET || (process.env.BETTER_AUTH_SECRET as string);

    // Verificar el token JWT usando jsonwebtoken
    const payload = jwt.verify(token, jwtSecret, {
      issuer: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      audience: 'coach360',
    }) as JWTUserPayload;

    return payload;
  } catch (error) {
    console.error('Error verificando token JWT:', error);
    return null;
  }
};

/**
 * Middleware para proteger rutas API con autenticación JWT
 * @param request - El objeto de solicitud Next.js
 * @returns Un objeto con éxito y la información del usuario o un error
 */
export const authenticateWithJWT = async (request: Request) => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      message: 'Token de autorización requerido',
      status: 401,
    };
  }

  const token = authHeader.substring(7); // Remover 'Bearer ' del principio
  const userPayload = await validateJWTToken(token);

  if (!userPayload) {
    return {
      success: false,
      message: 'Token inválido o expirado',
      status: 401,
    };
  }

  return {
    success: true,
    user: userPayload,
    status: 200,
  };
};
