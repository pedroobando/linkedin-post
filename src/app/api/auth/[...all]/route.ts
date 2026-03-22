/**
 * API Endpoint: Better Auth Handler
 *
 * Este endpoint maneja todas las operaciones de autenticación de Better Auth.
 * Incluye endpoints para login, registro, verificación de email, recuperación de contraseña, etc.
 *
 * @usage
 * GET/POST /api/auth/[...all]
 *
 * @description
 * Este endpoint actúa como un manejador universal para todas las operaciones
 * de autenticación proporcionadas por Better Auth. Maneja rutas como:
 * - /api/auth/signin (inicio de sesión)
 * - /api/auth/signup (registro de usuario)
 * - /api/auth/verify-email (verificación de email)
 * - /api/auth/forgot-password (recuperación de contraseña)
 * - Y muchos otros endpoints de autenticación
 *
 * @note
 * Este endpoint está protegido por la configuración de Better Auth
 * y no requiere autenticación adicional.
 */

import { auth } from '@/lib/auth';
// import { NextRequest } from 'next/server';
import { toNextJsHandler } from 'better-auth/next-js';

// export async function POST(req: NextRequest) {
//   return auth.handler(req);
// }

// export async function GET(req: NextRequest) {
//   return auth.handler(req);
// }

export const { POST, GET } = toNextJsHandler(auth);
