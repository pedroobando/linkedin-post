/**
 * Helper para generar tokens JWT
 *
 * Este helper se puede usar para crear tokens JWT
 * que pueden ser utilizados para autenticación o transmisión de información segura.
 */

import jwt from 'jsonwebtoken';

interface JWTUserPayload {
  userId: string;
  [key: string]: unknown; // Permitir propiedades adicionales
}

/**
 * Genera un token JWT firmado
 * @param payload - La información a incluir en el token
 * @param expiresIn - Tiempo de expiración del token (por defecto 24 horas)
 * @returns El token JWT generado o null si falla
 */
export const generateJWTToken = async (payload: JWTUserPayload, expiresIn: string = '24h'): Promise<string | null> => {
  try {
    const jwtSecret = process.env.BETTER_AUTH_JWT_SECRET || (process.env.BETTER_AUTH_SECRET as string);

    if (!jwtSecret) {
      console.error('JWT secret no configurado');
      return null;
    }

    // Excluir email y role del payload para el token JWT
    const { email, role, ...payloadWithoutSensitiveInfo } = payload;

    // Añadir información estándar al payload
    const tokenPayload = {
      ...payloadWithoutSensitiveInfo,
      iat: Math.floor(Date.now() / 1000), // Timestamp de emisión
      exp: Math.floor((Date.now() + (typeof expiresIn === 'string' ? parseTime(expiresIn) : expiresIn)) / 1000), // Timestamp de expiración
    };

    // Firmar el token JWT usando jsonwebtoken
    const token = jwt.sign(tokenPayload, jwtSecret, {
      issuer: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      audience: 'coach360',
      algorithm: 'HS256',
    });

    return token;
  } catch (error) {
    console.error('Error generando token JWT:', error);
    return null;
  }
};

/**
 * Convierte una cadena de tiempo (ej: '24h', '7d') a milisegundos
 * @param time - Cadena de tiempo a parsear
 * @returns Número de milisegundos
 */
function parseTime(time: string): number {
  const timeRegex = /^(\d+)([smhd])$/;
  const match = time.match(timeRegex);

  if (!match) {
    throw new Error(`Formato de tiempo inválido: ${time}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unidad de tiempo desconocida: ${unit}`);
  }
}

/**
 * Genera un token JWT con tiempo de expiración personalizado
 * @param payload - La información a incluir en el token
 * @param expiresIn - Tiempo de expiración del token (ej: '24h', '7d')
 * @returns El token JWT generado o null si falla
 */
export const generateJWTTokenWithExpiry = async (
  payload: JWTUserPayload,
  expiresIn: string,
): Promise<string | null> => {
  return generateJWTToken(payload, expiresIn);
};
