/**
 * Convierte una duración en diferentes formatos a minutos
 * @param duration - Cadena que representa la duración (ej: '2h', '1d', '300min', '150m')
 * @returns Número de minutos equivalentes
 */
export function convertToMinutes(duration: string | number): number {
  // Si es un número, asumimos que ya está en minutos
  if (typeof duration === 'number') {
    return Math.floor(duration);
  }

  // Expresión regular para parsear el valor y la unidad
  const regex = /^(\d+)([hdminm]?)$/i;
  const match = duration.trim().match(regex);

  if (!match) {
    throw new Error(`Formato de duración inválido: ${duration}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'd':
      return value * 24 * 60; // días a minutos
    case 'h':
      return value * 60; // horas a minutos
    case 'min':
    case 'm':
    default:
      return value; // minutos
  }
}