/**
 * API Endpoint: Generate JWT Token
 *
 * Este endpoint permite renovar un token JWT existente.
 * El token viejo se verifica y se genera un nuevo token con la misma información.
 *
 * @usage
 * POST /api/auth/generate-jwt
 *
 * @headers
 * Authorization: Bearer {jwt_token_viejo}
 * Content-Type: application/json
 *
 * @responses
 * 200: {
 *   "success": true,
 *   "token": "jwt_token_renovado",
 *   "expiresIn": "tiempo_de_expiración"
 * }
 *
 * 401: {
 *   "success": false,
 *   "message": "Token inválido o expirado"
 * }
 *
 * 500: {
 *   "success": false,
 *   "message": "Error interno del servidor"
 * }
 *
 * @example
 * curl -X POST http://localhost:3000/api/auth/generate-jwt \
 *   -H "Authorization: Bearer jwt_token_viejo_aqui" \
 *   -H "Content-Type: application/json"
 *
 * @note
 * Este endpoint requiere un token JWT válido para funcionar.
 * El token JWT generado tiene una validez de 2 días.
 */

import { NextRequest } from 'next/server';
import { validateJWTToken } from '@/lib/validate-jwt';
import { generateJWTToken } from '@/lib/generate-jwt';

export async function POST(req: NextRequest) {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers.get('authorization');

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

    // Validar el token JWT existente
    const userPayload = await validateJWTToken(token);

    if (!userPayload) {
      return Response.json(
        {
          success: false,
          message: 'Token inválido o expirado',
        },
        { status: 401 },
      );
    }

    // Generar un nuevo token JWT usando la función de utilidad
    const jwtToken = await generateJWTToken(
      {
        userId: userPayload.userId,
      },
      '2d',
    ); // 2 días de expiración

    return Response.json(
      {
        success: true,
        token: jwtToken,
        expiresIn: '2d', // Debe coincidir con la configuración de JWT
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error generando JWT:', error);

    return Response.json(
      {
        success: false,
        message: 'Error interno del servidor',
      },
      { status: 500 },
    );
  }
}
